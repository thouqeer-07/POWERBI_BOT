import os
import json
import requests
from dotenv import load_dotenv

# Try to import streamlit for secrets management
try:
    import streamlit as st
except ImportError:
    st = None

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
        # Helper to get secret/env
        def get_conf(key, default=None):
            val = None
            if st and hasattr(st, "secrets"):
                try:
                    val = st.secrets.get(key)
                except Exception:
                    pass
            return val or os.getenv(key) or default

        self.superset_url = (superset_url or get_conf("SUPERSET_PUBLIC_URL") or get_conf("SUPERSET_URL") or "http://localhost:8088").rstrip("/")
        self.api_key = api_key or get_conf("SUPERSET_API_KEY")
        self.username = username or get_conf("SUPERSET_USERNAME")
        self.password = password or get_conf("SUPERSET_PASSWORD")
        self.database_id = database_id or get_conf("SUPERSET_DATABASE_ID")
        self._token = None
        self.session = requests.Session()
        self._csrf_token = None

    def _get_db_connection(self):
        """Get a database connection using DB_URI."""
        try:
            import psycopg2
        except ImportError:
            raise RuntimeError("psycopg2 not installed. Run: pip install psycopg2-binary")

        # Helper to get secret/env
        def get_conf(key):
            val = None
            if st and hasattr(st, "secrets"):
                val = st.secrets.get(key)
            return val or os.getenv(key)

        # 1. Use DB_URI for both Data and Metadata (Unified Setup)
        db_uri = get_conf("DB_URI")
        if db_uri:
            print(f"DEBUG: Connecting to database using DB_URI...")
            return psycopg2.connect(db_uri, connect_timeout=10)
        
        # 2. Fallback to Localhost (Local development only)
        print(f"DEBUG: Connecting to DB using Localhost fallback...")
        return psycopg2.connect(
            host="localhost",
            port=5432,
            database="superset",
            user="superset",
            password="superset_password",
            connect_timeout=5
        )

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
        """Wrapper for requests with auto-reauthentication and retries."""
        endpoint = endpoint.lstrip("/")
        url = f"{self.superset_url}/{endpoint}"
        
        # Ensure headers are present
        if "headers" not in kwargs:
            kwargs["headers"] = self._auth_headers()
            
        import time
        # Allow retries to be configured (default 3)
        # We pop it from kwargs so it doesn't get passed to requests.request
        max_retries = kwargs.pop("retries", 3)
        retry_delay = 2 # seconds
        
        for attempt in range(max_retries):
            try:
                print(f"DEBUG: {method} {url} (Attempt {attempt + 1})")
                # Set allow_redirects=True to handle 308 redirects from no-slash to slash (common in ngrok/Superset)
                resp = self.session.request(method, url, allow_redirects=True, **kwargs)
                print(f"DEBUG: Response Status: {resp.status_code}")
                
                # Log request details
                if resp.status_code >= 400:
                    try:
                        error_json = resp.json()
                        print(f"DEBUG: Response Body: {error_json}")
                    except json.JSONDecodeError:
                        print(f"DEBUG: Response Body: {resp.text}")
                
                # Specialized logging for 422 Unprocessable Entity
                if resp.status_code == 422:
                    print(f"❌ Superset 422 Error at {url}:")
                    try:
                        # Attempt to get payload from kwargs, prioritizing 'json' then 'data'
                        payload_sent = kwargs.get('json') or kwargs.get('data')
                        print(f"   Payload sent: {payload_sent}")
                        print(f"   Detailed error info: {resp.json()}")
                    except Exception:
                        print(f"   Raw response: {resp.text}")
                
                # If 401, try to refresh token and retry once
                if resp.status_code == 401:
                    print("DEBUG: Got 401, attempting to re-authenticate...")
                    self._token = None # Clear invalid token
                    # Force new headers with new token
                    kwargs["headers"] = self._auth_headers() 
                    resp = self.session.request(method, url, **kwargs)
                    print(f"DEBUG: Retry Response Status: {resp.status_code}")
                    
                if not resp.ok:
                    details = ""
                    if resp.status_code == 422:
                        try:
                            err_data = resp.json()
                            details = f" - Info: {err_data}"
                        except:
                            details = f" - Body: {resp.text}"
                    
                    print(f"DEBUG: Response Error Body: {resp.text}")
                    
                    # DO NOT raise here, just check if we should retry
                    # 4xx errors (except 401) should NOT be retries by the general loop
                    if resp.status_code < 500 and resp.status_code != 408:
                         raise RuntimeError(f"Request failed: {resp.status_code}{details}")

                if resp.status_code in [500, 502, 503, 504, 408] and attempt < max_retries - 1:
                    print(f"DEBUG: Transient error {resp.status_code}. Retrying in {retry_delay}s...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                
                if not resp.ok:
                     raise RuntimeError(f"Request failed after retries: {resp.status_code}")

                return resp
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"DEBUG: Request failed: {e}. Retrying in {retry_delay}s...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    continue
                # Wrap connection errors etc.
                raise RuntimeError(f"Request failed after {max_retries} attempts: {e}")

    def _ensure_token(self):
        if self._token:
            return self._token
        if not (self.username and self.password):
            raise RuntimeError("No API key or username/password configured for Superset authentication")
        
        url = f"{self.superset_url}/api/v1/security/login"
        payload = {"username": self.username, "password": self.password, "provider": "db"}
        
        headers = {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true"
        }
        
        # Use session to persist cookies
        print(f"DEBUG: Authenticating to {url}...")
        resp = self.session.post(url, json=payload, headers=headers, timeout=30)
        
        if not resp.ok:
            print(f"DEBUG: Authentication failed ({resp.status_code}): {resp.text}")
        
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
        headers = {
            "Authorization": f"Bearer {self._token}",
            "ngrok-skip-browser-warning": "true"
        }
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
        """Find database ID by name using server-side filtering."""
        import json
        
        # Use Rison/JSON filter to find exact match on server side
        # This avoids pagination issues
        filters = [
            {
                "col": "database_name",
                "opr": "eq",
                "value": database_name
            }
        ]
        params = {"q": json.dumps({"filters": filters})}
        
        try:
            print(f"DEBUG: Searching for database '{database_name}' via API filter...")
            resp = self._request("GET", "api/v1/database/", params=params, timeout=30)
            if resp.ok:
                dbs = resp.json().get("result", [])
                for db in dbs:
                     if db.get("database_name") == database_name:
                         print(f"  - Found: '{database_name}' (ID: {db.get('id')})")
                         return db.get("id")
        except Exception as e:
            print(f"Warning: Database filtered search failed: {e}")

        # Fallback: List all (up to limit) and text search
        resp = self.list_databases()
        dbs = resp.get("result", [])
        
        print(f"DEBUG: Searching for database '{database_name}' in {len(dbs)} registered databases (fallback)...")
        for db in dbs:
            curr_name = db.get("database_name")
            # print(f"  - Found: '{curr_name}' (ID: {db.get('id')})")
            if curr_name and curr_name.lower() == database_name.lower():
                return db.get("id")
        
        return None

    def create_dataset(self, database_id, schema, table_name, dataset_name=None):
        """Create a dataset entry that references an existing table in a connected database.
        
        If dataset already exists, try to find and return it.
        """
        try:
            # List all databases to find the correct one and log it prominently
            db_resp = self._request("GET", "api/v1/database/", timeout=10)
            if db_resp.ok:
                dbs = db_resp.json().get("result", [])
                print("*" * 50)
                print("DEBUG: SUPERSET DATABASE DISCOVERY")
                for db in dbs:
                    print(f"  - DB ID {db.get('id')}: {db.get('database_name')} (Type: {db.get('backend')})")
                print("*" * 50)
                
                # If we only have one database and it's ID 1, we might be using the metadata DB for data
                # If we have multiple, the user needs to know WHICH one is Supabase.
        except Exception as e:
            print(f"Warning: Could not list databases: {e}")

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
                    # Check for "already exists" inside the exception
                    if "already exists" in str(e) or "422" in str(e):
                          print("DEBUG: Dataset already exists (caught exception). Fetching existing dataset...")
                          
                          # Try to extract ID from error message if present (rare but possible)
                          import re
                          match = re.search(r'Dataset\s+(\d+)\s+already exists', str(e))
                          if match:
                              found_id = match.group(1)
                              print(f"DEBUG: Extracted ID {found_id} from error message!")
                              return {"id": int(found_id), "table_name": table_name, "database": {"id": database_id}}

                          existing_ds = self._find_dataset(database_id, table_name)
                          if existing_ds:
                              return existing_ds
                    
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
                    existing_ds = self._find_dataset(database_id, table_name)
                    if existing_ds:
                        return existing_ds
                    
                    # If we can't find it, we can't proceed. Returning 'body' causes NoneType errors downstream.
                    # Raise an error to be caught by the app.
                    raise RuntimeError(f"Dataset '{table_name}' already exists, but could not be found via API. Check database permissions or name mismatch.")

                print(f"DEBUG: Failed with status {resp.status_code}: {body}")
                errors.append(f"{endpoint} + {payload} => Status {resp.status_code}: {body}")

        # if we reach here, all attempts failed
        raise RuntimeError(f"All dataset creation attempts failed. Errors: {json.dumps(errors, indent=2)}")

    def _find_dataset(self, database_id, table_name):
        """Helper to find a dataset by db and table name."""
        try:
            # 1. Try Server-Side Filtering (Fastest)
            import json
            filters = [{"col": "table_name", "opr": "eq", "value": table_name}]
            params = {"q": json.dumps({"filters": filters})}
            
            print(f"DEBUG: Searching for dataset '{table_name}' via API filter...")
            resp = self._request("GET", "api/v1/dataset/", params=params, timeout=30)
            
            found_ds = None
            if resp.ok:
                datasets = resp.json().get("result", [])
                for ds in datasets:
                     if self._check_dataset_match(ds, database_id, table_name):
                         return ds
            
            # 2. Fallback: Brute Force Iteration (Reliable)
            print("DEBUG: Filtered search returned nothing. Trying brute-force iteration (page_size=2000)...")
            params = {"q": json.dumps({"page_size": 2000})} # Get EVERYTHING
            resp = self._request("GET", "api/v1/dataset/", params=params, timeout=45)
            
            if resp.ok:
                datasets = resp.json().get("result", [])
                print(f"DEBUG: Scanned {len(datasets)} datasets manually...")
                for ds in datasets:
                    if self._check_dataset_match(ds, database_id, table_name):
                        return ds
            
            # 3. Last Resort: Direct Database Query (Bypasses API visibility issues)
            print("DEBUG: API search failed. Trying direct Metadata DB query...")
            direct_result = self._find_dataset_direct(database_id, table_name)
            if direct_result:
                return direct_result

            # 4. NUCLEAR OPTION: Fast Parallel Probe (IDs 1-500)
            # If DB query failed (connection issues) and List failed (visibility), 
            # we blindly check IDs in parallel.
            print("DEBUG: Direct DB failed. Probing IDs 1-500 via API (Parallel)...")
            
            import concurrent.futures

            def check_id(pid):
                try:
                    # Short timeout, we want speed
                    r = self._request("GET", f"api/v1/dataset/{pid}", timeout=2)
                    if r.ok:
                        d = r.json().get("result", {})
                        if self._check_dataset_match(d, database_id, table_name):
                            return d
                    else:
                        # Log non-404 errors to help debug
                        if r.status_code != 404:
                            print(f"DEBUG: Probe ID {pid} failed: {r.status_code}")
                except Exception as e:
                    print(f"DEBUG: Probe ID {pid} error: {e}")
                return None

            with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
                futures = {executor.submit(check_id, i): i for i in range(1, 1001)}
                for future in concurrent.futures.as_completed(futures):
                    result = future.result()
                    if result:
                        print(f"✅ Found dataset via Parallel Probe: ID {result.get('id')}")
                        return result

        except Exception as e:
            print(f"Warning: Could not search for existing dataset: {e}")
        return None

    def _find_dataset_direct(self, database_id, table_name):
        """Query the Superset metadata database directly to find the table ID."""
        try:
            conn = self._get_db_connection()
            cursor = conn.cursor()
            
            # Query the 'tables' table (standard Superset model)
            sql = "SELECT id FROM tables WHERE table_name = %s AND database_id = %s"
            cursor.execute(sql, (table_name, int(database_id)))
            result = cursor.fetchone()
            
            cursor.close()
            conn.close()
            
            if result:
                 d_id = result[0]
                 print(f"✅ Found existing dataset ID via DB: {d_id}")
                 # Return a minimal dict that satisfies downstream code
                 return {"id": d_id, "table_name": table_name, "database": {"id": int(database_id)}}
            
            print("DEBUG: Dataset not found in metadata DB.")
            return None
            
        except Exception as e:
            print(f"Warning: Direct DB dataset lookup failed: {e}")
            return None

    def _check_dataset_match(self, ds, database_id, table_name):
        """Helper to check if a dataset dict matches our target."""
        ds_db = ds.get("database", {})
        ds_db_id = ds_db.get("id") if isinstance(ds_db, dict) else ds_db
        
        # print(f"DEBUG: Checking {ds.get('table_name')} (DB {ds_db_id})...")
        
        ds_table = ds.get("table_name")
        if str(ds_db_id) == str(database_id) and ds_table and ds_table.lower() == table_name.lower():
            print(f"DEBUG: Found existing dataset ID: {ds.get('id')} for table {table_name}")
            return True
        return False

    def create_chart(self, dataset_id, chart_name, viz_type, params=None):
        """Create a chart (slice) referencing a dataset.

        `params` should be a dict matching the chart params expected by Superset for `viz_type`.
        Returns chart JSON.
        """

        # Try with owner ID 1 (admin) first, then fallback
        payload = {
            "slice_name": chart_name,
            "viz_type": viz_type,
            "datasource_id": int(dataset_id),
            "datasource_type": "table",
            "params": json.dumps(params or {}),
            "owners": [1] 
        }
        
        print(f"DEBUG: Attempting chart creation for table ID {dataset_id}...")
        
        try:
            # We already have allow_redirects=True in _request
            resp = self._request("POST", "api/v1/chart/", json=payload, timeout=40)
            
            if not resp.ok:
                print(f"DEBUG: Chart API failed ({resp.status_code}). Response: {resp.text}")
                if "owners" in payload:
                    print("DEBUG: Retrying WITHOUT 'owners' field...")
                    payload.pop("owners")
                    resp = self._request("POST", "api/v1/chart/", json=payload, timeout=40)
            
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            # Fallback: use direct database insertion
            print(f"API chart creation failed: {e}. Trying database-direct method...")
            if "relation \"slices\" does not exist" in str(e) or "psycopg2" in str(e):
                 print("TIP: If you are on Streamlit Cloud, you MUST set SUPERSET_METADATA_DB_URI to your Superset database URI for this fallback to work.")
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
        
        # Connect directly to PostgreSQL (exposed on localhost:5432)
        conn = None
        try:
            conn = self._get_db_connection()
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
            raise RuntimeError(f"Cannot connect to PostgreSQL for metadata: {str(e)}")
        except psycopg2.errors.UndefinedTable as e:
            print(f"❌ CRITICAL ERROR: The table 'slices' was not found in the current database.")
            print(f"💡 REASON: Your database migrations might not have been run, or DB_URI is pointing to the wrong place.")
            print(f"💡 FIX: Ensure you have run 'superset db upgrade' to create the Superset tables in your database.")
            if conn:
                conn.rollback()
                conn.close()
            raise RuntimeError(f"Metadata table 'slices' missing. Please ensure migrations were run on your DB_URI.")
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
            resp = self._request("POST", "api/v1/dashboard/", json=payload, timeout=30)
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
        try:
            print(f"Creating dashboard via database: {dashboard_title}")
            conn = self._get_db_connection()
            
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
            
        except psycopg2.errors.UndefinedTable as e:
            print(f"❌ CRITICAL ERROR: The table 'dashboards' was not found.")
            print(f"💡 FIX: Set 'SUPERSET_METADATA_DB_URI' to your Superset metadata database.")
            if conn:
                conn.rollback()
                conn.close()
            raise RuntimeError(f"Metadata table 'dashboards' missing.")
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
        try:
            print(f"Linking {len(chart_ids)} charts to dashboard {dashboard_id} via database...")
            conn = self._get_db_connection()
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
                 c_resp = self._request("GET", f"api/v1/chart/{c_id}/", timeout=10)
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
        resp = self._request("PUT", f"api/v1/dashboard/{dashboard_id}/", json=payload, timeout=30)
        
        if not resp.ok:
            print(f"DEBUG: Dashboard update failed: {resp.text}")
            raise RuntimeError(f"Failed to update dashboard: {resp.status_code} - {resp.text}")
            
        # 5. Link charts AFTER dashboard update
        # This prevents the dashboard update from overwriting the links
        print(f"DEBUG: Linking {len(chart_ids)} charts to dashboard {dashboard_id}...")
        for c_id in chart_ids:
            try:
                self._request("PUT", f"api/v1/chart/{c_id}/", json={"dashboards": [int(dashboard_id)]}, timeout=10)
            except Exception as e:
                print(f"Warning: Failed to link chart {c_id} to dashboard: {e}")

        return resp.json()

    def list_dashboards(self):
        resp = self._request("GET", "api/v1/dashboard/", timeout=30)
        resp.raise_for_status()
        return resp.json()

    def add_database(self, database_name, sqlalchemy_uri):
        """Add a new database connection to Superset, or return existing one if name matches."""
        # 1. Check if it already exists to avoid 422 Unprocessable Entity (Duplicate)
        existing_id = self.get_database_id(database_name)
        if existing_id:
            print(f"DEBUG: Database '{database_name}' already exists with ID {existing_id}. Skipping creation.")
            return {"id": existing_id, "database_name": database_name, "message": "Already exists"}

        payload = {
            "database_name": database_name,
            "sqlalchemy_uri": sqlalchemy_uri
        }
        
        try:
            resp = self._request("POST", "api/v1/database/", json=payload, timeout=30)
            # _request already raises RuntimeError if it fails
            return resp.json()
        except Exception as e:
            # If we still got a 422 or any fail, try ONE LAST TIME to find the ID 
            # (Just in case it was created in a parallel rerun)
            print(f"DEBUG: add_database failed: {e}. Final attempt to find existing ID...")
            import time
            time.sleep(1)
            final_check_id = self.get_database_id(database_name)
            if final_check_id:
                return {"id": final_check_id, "database_name": database_name, "message": "Recovered ID after failure"}
            
            # FINAL FALLBACK: If it's "Already exists" and we CANNOT find it, assume it is ID 1 (common for single-db Superset)
            if "already exists" in str(e) or "422" in str(e):
                print("DEBUG: Database exists but cannot be found. ASSUMING ID 1 (Default).")
                return {"id": 1, "database_name": database_name, "message": "Assumed ID 1 (Fallback)"}

            raise e

    def list_databases(self):
        """Return list of databases configured in Superset (useful to pick database_id)."""
        import json
        # Request a larger page size to ensure we don't miss our database if many exist
        params = {"q": json.dumps({"page_size": 2000})}
        resp = self._request("GET", "api/v1/database/", params=params, timeout=30)
        return resp.json()

    def dashboard_url(self, dashboard_id):
        return f"{self.superset_url}/superset/dashboard/{dashboard_id}/"

    def delete_dashboard(self, dashboard_id):
        """Delete a dashboard by ID."""
        try:
            resp = self._request("DELETE", f"api/v1/dashboard/{dashboard_id}/", timeout=30)
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
        try:
            print(f"Deleting dashboard {dashboard_id} via database...")
            conn = self._get_db_connection()
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
