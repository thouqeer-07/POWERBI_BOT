import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()


class SupersetClient:
    """Minimal Apache Superset REST helper (best-effort prototype).

    Notes and limitations:
    - Superset API shapes and auth methods vary by version and configuration. This client
      supports either an API key (Bearer) via `SUPERSET_API_KEY` or login via username/password
      to obtain an access token (supported by many Superset installs at `/api/v1/security/login`).
    - Programmatic creation of datasets/charts/dashboards is possible but often requires
      additional configuration (database connections, table availability). This client attempts
      basic dataset/chart/dashboard creation but you may need to adapt payloads for your Superset version.
    - If you need a robust automated flow (CSV -> DB table -> Superset dataset -> chart -> dashboard),
      you typically need a writable database and Superset configured with that database.
    """

    def __init__(self, superset_url=None, api_key=None, username=None, password=None, database_id=None):
        self.superset_url = (superset_url or os.getenv("SUPERSET_URL") or "http://localhost:8088").rstrip("/")
        self.api_key = api_key or os.getenv("SUPERSET_API_KEY")
        self.username = username or os.getenv("SUPERSET_USERNAME")
        self.password = password or os.getenv("SUPERSET_PASSWORD")
        self.database_id = database_id or os.getenv("SUPERSET_DATABASE_ID")
        self._token = None
        self.session = requests.Session()
        self._csrf_token = None

    def _auth_headers(self):
        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
            return headers
        
        token = self._ensure_token()
        headers["Authorization"] = f"Bearer {token}"
        
        # Ensure CSRF token is present for session-based auth (or strict API)
        if not self._csrf_token:
            self._csrf_token = self._get_csrf_token()
        
        if self._csrf_token:
            headers["X-CSRFToken"] = self._csrf_token
            
        # Bypass ngrok browser warning
        headers["ngrok-skip-browser-warning"] = "true"

        return headers

    def _request(self, method, endpoint, **kwargs):
        """Wrapper for requests with auto-reauthentication on 401."""
        endpoint = endpoint.lstrip("/")
        url = f"{self.superset_url}/{endpoint}"
        
        # Ensure headers are present
        if "headers" not in kwargs:
            kwargs["headers"] = self._auth_headers()
        
        try:
            resp = self.session.request(method, url, **kwargs)
            
            # If 401, try to refresh token and retry once
            if resp.status_code == 401:
                print("DEBUG: Got 401, attempting to re-authenticate...")
                self._token = None # Clear invalid token
                # Force new headers with new token
                kwargs["headers"] = self._auth_headers() 
                resp = self.session.request(method, url, **kwargs)
                
            return resp
        except Exception as e:
            # Wrap connection errors etc.
            raise RuntimeError(f"Request failed: {e}")

    def _ensure_token(self):
        if self._token:
            return self._token
        if not (self.username and self.password):
            raise RuntimeError("No API key or username/password configured for Superset authentication")
        
        url = f"{self.superset_url}/api/v1/security/login"
        payload = {"username": self.username, "password": self.password, "provider": "db"}
        
        # Use session to persist cookies
        resp = self.session.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        
        token = data.get("access_token") or data.get("result", {}).get("access_token")
        if not token:
            token = data.get("result") and data.get("result").get("access_token")
        if not token:
            raise RuntimeError(f"Could not obtain Superset access token: {data}")
        
        self._token = token
        return token

    def _get_csrf_token(self):
        """Fetch CSRF token using the current session/token."""
        # This is a special case, we don't use _request to avoid infinite recursion if it fails
        url = f"{self.superset_url}/api/v1/security/csrf_token/"
        headers = {"Authorization": f"Bearer {self._token}"}
        try:
            resp = self.session.get(url, headers=headers, timeout=10)
            resp.raise_for_status()
            return resp.json().get("result")
        except Exception as e:
            print(f"Warning: Could not fetch CSRF token: {e}")
            return None

    def ping(self):
        resp = self._request("GET", "api/v1/version", timeout=10)
        resp.raise_for_status()
        return resp.json()

    def get_database_id(self, database_name):
        """Find database ID by name."""
        dbs = self.list_databases().get("result", [])
        for db in dbs:
            if db.get("database_name") == database_name:
                return db.get("id")
        return None

    def create_dataset(self, database_id, schema, table_name, dataset_name=None):
        """Create a dataset entry that references an existing table in a connected database.
        
        If dataset already exists, try to find and return it.
        """
        # Try multiple payload shapes since Superset API expects either database id or object depending on version
        # Try multiple payload shapes since Superset API expects either database id or object depending on version
        endpoints = ["api/v1/dataset", "api/v1/dataset/"]
        payloads = []
        # payload where database is an id
        payloads.append({
            "database": int(database_id),
            "schema": schema,
            "table_name": table_name,
            "sql": None,
        })
        # payload where database is an object
        payloads.append({
            "database": {"id": int(database_id)},
            "schema": schema,
            "table_name": table_name,
            "sql": None,
        })

        errors = []
        for endpoint in endpoints:
            for payload in payloads:
                try:
                    print(f"DEBUG: Attempting create_dataset at {endpoint} with payload {payload}")
                    resp = self._request("POST", endpoint, json=payload, timeout=30)
                except Exception as e:
                    print(f"Request failed for endpoint={endpoint} payload={payload}: {e}")
                    errors.append(f"{endpoint} + {payload} => {e}")
                    continue
                
                # Try to parse body for diagnostic info
                try:
                    body = resp.json()
                except Exception:
                    body = resp.text
                
                if resp.ok:
                    print("DEBUG: Success!")
                    return body
                
                # Handle "already exists" case
                if resp.status_code == 422 and "already exists" in str(body):
                    print("DEBUG: Dataset already exists. Fetching existing dataset...")
                    # Try to find the dataset ID
                    # We can't easily search by table name via API in all versions, 
                    # but we can try to list datasets and filter.
                    # For now, let's just return a dummy success with the ID if we can find it, 
                    # or just raise a specific error that the app can handle.
                    # Better: try to fetch it.
                    return self._find_dataset(database_id, table_name) or body

                print(f"DEBUG: Failed with status {resp.status_code}: {body}")
                errors.append(f"{endpoint} + {payload} => Status {resp.status_code}: {body}")

        # if we reach here, all attempts failed
        raise RuntimeError(f"All dataset creation attempts failed. Errors: {json.dumps(errors, indent=2)}")

    def _find_dataset(self, database_id, table_name):
        """Helper to find a dataset by db and table name."""
        try:
            # This is inefficient but works for small setups
            resp = self._request("GET", "api/v1/dataset/", timeout=30)
            if resp.ok:
                datasets = resp.json().get("result", [])
                for ds in datasets:
                    # Check if it matches
                    # Note: 'database' field in list response might be an object or id
                    ds_db = ds.get("database", {})
                    ds_db_id = ds_db.get("id") if isinstance(ds_db, dict) else ds_db
                    
                    if int(ds_db_id) == int(database_id) and ds.get("table_name") == table_name:
                        return ds
        except Exception as e:
            print(f"Warning: Could not search for existing dataset: {e}")
        return None

    def create_chart(self, dataset_id, chart_name, viz_type, params=None):
        """Create a chart (slice) referencing a dataset.

        `params` should be a dict matching the chart params expected by Superset for `viz_type`.
        Returns chart JSON.
        """

        payload = {
            "slice_name": chart_name,
            "viz_type": viz_type,
            "datasource_id": int(dataset_id),
            "datasource_type": "table",
            "params": json.dumps(params or {}),
        }
        
        try:
            resp = self._request("POST", "api/v1/chart", json=payload, timeout=30)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            # Fallback: use direct database insertion
            print(f"API chart creation failed: {e}. Trying database-direct method...")
            return self._create_chart_direct(dataset_id, chart_name, viz_type, params)
    
    def _create_chart_direct(self, dataset_id, chart_name, viz_type, params=None):
        """Create chart by direct database insertion (bypasses buggy API)"""
        import uuid
        
        try:
            import psycopg2
        except ImportError:
            raise RuntimeError("psycopg2 not installed. Run: pip install psycopg2-binary")
        
        params_json = json.dumps(params or {})
        chart_uuid = str(uuid.uuid4())
        
        # Connect directly to PostgreSQL for metadata (slices, charts, etc.)
        conn = None
        # We use a dedicated metadata URI if provided, otherwise default to local
        metadata_db_uri = os.getenv("SUPERSET_METADATA_DB_URI") or "postgresql://superset:superset_password@localhost:5432/superset"
        try:
            print(f"Attempting metadata database connection...")
            conn = psycopg2.connect(metadata_db_uri, connect_timeout=5)
            print(f"✅ Connected to database")
            
            cursor = conn.cursor()
            
            # Insert chart
            sql = """
            INSERT INTO slices (
                slice_name, viz_type, datasource_id, datasource_type,
                params, uuid, created_on, changed_on
            ) VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
            RETURNING id;
            """
            
            print(f"Executing SQL insert for chart: {chart_name}")
            cursor.execute(sql, (chart_name, viz_type, int(dataset_id), 'table', params_json, chart_uuid))
            chart_id = cursor.fetchone()[0]
            
            conn.commit()
            cursor.close()
            conn.close()
            
            print(f"✅ Chart created via database with ID: {chart_id}")
            return {"id": chart_id, "slice_name": chart_name}
            
        except psycopg2.OperationalError as e:
            print(f"❌ Database connection failed: {str(e)}")
            if conn:
                conn.close()
            raise RuntimeError(f"Cannot connect to PostgreSQL: {str(e)}")
        except Exception as e:
            print(f"❌ Database insertion failed: {type(e).__name__}: {str(e)}")
            if conn:
                conn.rollback()
                conn.close()
            raise RuntimeError(f"Database chart creation failed: {str(e)}")

    def create_dashboard(self, dashboard_title, published=True):
        payload = {
            "dashboard_title": dashboard_title,
            "published": published
        }
        
        try:
            resp = self._request("POST", "api/v1/dashboard", json=payload, timeout=30)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            print(f"API dashboard creation failed: {e}. Trying database-direct method...")
            return self._create_dashboard_direct(dashboard_title, published)
    
    def _create_dashboard_direct(self, dashboard_title, published=True):
        """Create dashboard by direct database insertion"""
        import uuid
        
        try:
            import psycopg2
        except ImportError:
            raise RuntimeError("psycopg2 not installed")
        
        dashboard_uuid = str(uuid.uuid4())
        slug = dashboard_title.lower().replace(" ", "-").replace("_", "-")
        
        conn = None
        metadata_db_uri = os.getenv("SUPERSET_METADATA_DB_URI") or "postgresql://superset:superset_password@localhost:5432/superset"
        try:
            print(f"Creating dashboard via database: {dashboard_title}")
            conn = psycopg2.connect(metadata_db_uri, connect_timeout=5)
            
            cursor = conn.cursor()
            
            sql = """
            INSERT INTO dashboards (
                dashboard_title, slug, published, uuid,
                position_json, created_on, changed_on
            ) VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
            RETURNING id;
            """
            
            # Minimal position_json
            position_json = json.dumps({"DASHBOARD_VERSION_KEY": "v2"})
            
            cursor.execute(sql, (dashboard_title, slug, published, dashboard_uuid, position_json))
            dashboard_id = cursor.fetchone()[0]
            
            conn.commit()
            cursor.close()
            conn.close()
            
            print(f"✅ Dashboard created via database with ID: {dashboard_id}")
            return {"id": dashboard_id, "dashboard_title": dashboard_title, "slug": slug}
            
        except Exception as e:
            print(f"❌ Dashboard creation failed: {type(e).__name__}: {str(e)}")
            if conn:
                conn.rollback()
                conn.close()
            raise RuntimeError(f"Database dashboard creation failed: {str(e)}")

    def add_charts_to_dashboard(self, dashboard_id, chart_ids):
        """Link charts to a dashboard by updating its position_json.
        
        The 'slices' field is often read-only or not exposed in PUT.
        Instead, we must define the layout in 'position_json'.
        """
        try:
            return self._add_charts_to_dashboard_api(dashboard_id, chart_ids)
        except Exception as e:
            print(f"API chart linking failed: {e}. Trying database-direct method...")
            return self._add_charts_to_dashboard_direct(dashboard_id, chart_ids)
    
    def _add_charts_to_dashboard_direct(self, dashboard_id, chart_ids):
        """Link charts to dashboard via direct database updates"""
        import uuid
        
        try:
            import psycopg2
        except ImportError:
            raise RuntimeError("psycopg2 not installed")
        
        conn = None
        metadata_db_uri = os.getenv("SUPERSET_METADATA_DB_URI") or "postgresql://superset:superset_password@localhost:5432/superset"
        try:
            print(f"Linking {len(chart_ids)} charts to dashboard {dashboard_id} via database...")
            conn = psycopg2.connect(metadata_db_uri, connect_timeout=5)
            cursor = conn.cursor()
            
            # 1. Create position_json with charts
            position_json = {
                "DASHBOARD_VERSION_KEY": "v2",
                "ROOT_ID": {"type": "ROOT", "id": "ROOT_ID", "children": ["GRID_ID"]},
                "GRID_ID": {"type": "GRID", "id": "GRID_ID", "children": [], "parents": ["ROOT_ID"]},
            }
            
            grid_children = []
            
            for idx, c_id in enumerate(chart_ids):
                row_id = f"ROW-{uuid.uuid4().hex[:8]}"
                chart_node_id = f"CHART-{uuid.uuid4().hex[:8]}"
                
                grid_children.append(row_id)
                
                position_json[row_id] = {
                    "type": "ROW",
                    "id": row_id,
                    "children": [chart_node_id],
                    "meta": {"background": "BACKGROUND_TRANSPARENT"},
                    "parents": ["ROOT_ID", "GRID_ID"]
                }
                
                position_json[chart_node_id] = {
                    "type": "CHART",
                    "id": chart_node_id,
                    "children": [],
                    "meta": {
                        "chartId": int(c_id),
                        "width": 12,
                        "height": 50
                    },
                    "parents": ["ROOT_ID", "GRID_ID", row_id]
                }
            
            position_json["GRID_ID"]["children"] = grid_children
            
            # 2. Update dashboard position_json
            update_sql = "UPDATE dashboards SET position_json = %s, changed_on = NOW() WHERE id = %s"
            cursor.execute(update_sql, (json.dumps(position_json), int(dashboard_id)))
            
            # 3. Link charts to dashboard in dashboard_slices table
            for c_id in chart_ids:
                link_sql = "INSERT INTO dashboard_slices (dashboard_id, slice_id) VALUES (%s, %s) ON CONFLICT DO NOTHING"
                cursor.execute(link_sql, (int(dashboard_id), int(c_id)))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            print(f"✅ Linked {len(chart_ids)} charts to dashboard {dashboard_id} via database")
            return {"result": "success", "dashboard_id": dashboard_id}
            
        except Exception as e:
            print(f"❌ Database chart linking failed: {type(e).__name__}: {str(e)}")
            if conn:
                conn.rollback()
                conn.close()
            raise RuntimeError(f"Database chart linking failed: {str(e)}")
    
    def _add_charts_to_dashboard_api(self, dashboard_id, chart_ids):
        """Original API-based chart linking method"""
        import uuid
        
        # 1. Get current dashboard
        print(f"DEBUG: Fetching dashboard {dashboard_id} details...")
        get_resp = self._request("GET", f"api/v1/dashboard/{dashboard_id}", timeout=30)
        get_resp.raise_for_status()
        data = get_resp.json().get("result")
        
        # 2. Generate position_json
        # We'll create a simple vertical layout
        
        position_json = {
            "DASHBOARD_VERSION_KEY": "v2",
            "ROOT_ID": {"type": "ROOT", "id": "ROOT_ID", "children": ["GRID_ID"]},
            "GRID_ID": {"type": "GRID", "id": "GRID_ID", "children": [], "parents": ["ROOT_ID"]},
        }
        
        grid_children = []
        
        # We need chart details for position_json, so we fetch them first
        chart_details = []
        for c_id in chart_ids:
            try:
                 c_resp = self._request("GET", f"api/v1/chart/{c_id}", timeout=10)
                 if c_resp.ok:
                     chart_details.append(c_resp.json().get("result"))
            except Exception as e:
                print(f"Warning: Could not fetch details for chart {c_id}: {e}")

        for chart in chart_details:
            c_id = chart["id"]
            # Try to find UUID, might be 'uuid' or in 'params' or elsewhere depending on version
            # Usually top level 'uuid'
            c_uuid = chart.get("uuid")
            
            row_id = f"ROW-{uuid.uuid4().hex[:8]}"
            chart_node_id = f"CHART-{uuid.uuid4().hex[:8]}"
            
            # Add Row to Grid
            grid_children.append(row_id)
            
            # Define Row
            position_json[row_id] = {
                "type": "ROW",
                "id": row_id,
                "children": [chart_node_id],
                "meta": {"background": "BACKGROUND_TRANSPARENT"},
                "parents": ["ROOT_ID", "GRID_ID"]
            }
            
            # Define Chart
            chart_meta = {
                "chartId": int(c_id),
                "width": 12, # Full width
                "height": 50,
                "sliceName": chart.get("slice_name", "Chart")
            }
            if c_uuid:
                chart_meta["uuid"] = c_uuid
            
            position_json[chart_node_id] = {
                "type": "CHART",
                "id": chart_node_id,
                "children": [],
                "meta": chart_meta,
                "parents": ["ROOT_ID", "GRID_ID", row_id]
            }
            
        position_json["GRID_ID"]["children"] = grid_children
        
        # 3. Prepare payload
        owners = [o["id"] for o in data.get("owners", [])]
        
        payload = {
            "dashboard_title": data.get("dashboard_title"),
            "slug": data.get("slug"),
            "owners": owners,
            "position_json": json.dumps(position_json),
            "published": data.get("published", False)
        }
        
        # 4. Update Dashboard FIRST
        print(f"DEBUG: Updating dashboard {dashboard_id} with position_json...")
        resp = self._request("PUT", f"api/v1/dashboard/{dashboard_id}", json=payload, timeout=30)
        
        if not resp.ok:
            print(f"DEBUG: Dashboard update failed: {resp.text}")
            raise RuntimeError(f"Failed to update dashboard: {resp.status_code} - {resp.text}")
            
        # 5. Link charts AFTER dashboard update
        # This prevents the dashboard update from overwriting the links
        print(f"DEBUG: Linking {len(chart_ids)} charts to dashboard {dashboard_id}...")
        for c_id in chart_ids:
            try:
                self._request("PUT", f"api/v1/chart/{c_id}", json={"dashboards": [int(dashboard_id)]}, timeout=10)
            except Exception as e:
                print(f"Warning: Failed to link chart {c_id} to dashboard: {e}")

        return resp.json()

    def list_dashboards(self):
        resp = self._request("GET", "api/v1/dashboard/", timeout=30)
        resp.raise_for_status()
        return resp.json()

    def add_database(self, database_name, sqlalchemy_uri):
        """Add a new database connection to Superset."""
        payload = {
            "database_name": database_name,
            "sqlalchemy_uri": sqlalchemy_uri
        }
        resp = self._request("POST", "api/v1/database/", json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()

    def list_databases(self):
        """Return list of databases configured in Superset (useful to pick database_id)."""
        resp = self._request("GET", "api/v1/database/", timeout=30)
        resp.raise_for_status()
        return resp.json()

    def dashboard_url(self, dashboard_id):
        return f"{self.superset_url}/superset/dashboard/{dashboard_id}/"

    def delete_dashboard(self, dashboard_id):
        """Delete a dashboard by ID."""
        try:
            resp = self._request("DELETE", f"api/v1/dashboard/{dashboard_id}", timeout=30)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            print(f"API dashboard deletion failed: {e}. Trying database-direct method...")
            return self._delete_dashboard_direct(dashboard_id)
    
    def _delete_dashboard_direct(self, dashboard_id):
        """Delete dashboard via direct database deletion"""
        try:
            import psycopg2
        except ImportError:
            raise RuntimeError("psycopg2 not installed")
        
        conn = None
        metadata_db_uri = os.getenv("SUPERSET_METADATA_DB_URI") or "postgresql://superset:superset_password@localhost:5432/superset"
        try:
            print(f"Deleting dashboard {dashboard_id} via database...")
            conn = psycopg2.connect(metadata_db_uri, connect_timeout=5)
            cursor = conn.cursor()
            
            # Delete from dashboard_slices (linking table) first
            cursor.execute("DELETE FROM dashboard_slices WHERE dashboard_id = %s", (int(dashboard_id),))
            
            # Delete dashboard
            cursor.execute("DELETE FROM dashboards WHERE id = %s", (int(dashboard_id),))
            
            conn.commit()
            cursor.close()
            conn.close()
            
            print(f"✅ Dashboard {dashboard_id} deleted via database")
            return {"result": "success"}
            
        except Exception as e:
            print(f"❌ Database dashboard deletion failed: {type(e).__name__}: {str(e)}")
            if conn:
                conn.rollback()
                conn.close()
            raise RuntimeError(f"Database dashboard deletion failed: {str(e)}")
        
    def get_columns(self, dataset_id):
        """Get list of columns for a dataset."""
        try:
            resp = self._request("GET", f"api/v1/dataset/{dataset_id}", timeout=10)
            if resp.ok:
                result = resp.json().get("result", {})
                columns = result.get("columns", [])
                return [c.get("column_name") for c in columns if c.get("column_name")]
        except Exception as e:
            print(f"Warning: Could not fetch columns for dataset {dataset_id}: {e}")
        return []
