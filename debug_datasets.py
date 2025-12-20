import os
import json
from dotenv import load_dotenv
from superset_client import SupersetClient

# Load env vars
load_dotenv()

def run_debug():
    print("--- Starting Superset Dataset Debug ---")
    
    # Init client
    client = SupersetClient(
        superset_url="http://localhost:8088",
        username=os.getenv("SUPERSET_USERNAME"),
        password=os.getenv("SUPERSET_PASSWORD")
    )
    
    try:
        token = client._ensure_token()
        print(f"Authenticated: {token is not None}")
    except Exception as e:
        print(f"Authentication Failed: {e}")

    # 1. Try generic list with high limit
    print("\n[1] Listing All Datasets (Limit 200 via Filter)...")
    try:
        resp = client._request("GET", "api/v1/dataset/", params={"q": '{"page_size": 200}'})
        if resp.ok:
            results = resp.json().get("result", [])
            print(f"Found {len(results)} datasets.")
            for ds in results:
                db_id = ds.get("database", {}).get("id")
                print(f"  - ID: {ds.get('id')} | Name: {ds.get('table_name')} | DB: {db_id}")
        else:
            print(f"List failed: {resp.status_code}")
    except Exception as e:
        print(f"List error: {e}")

    # 2. Probe Deep
    print("\n[2] Probing IDs 1 to 20...")
    found_any = False
    for i in range(1, 21):
        try:
            # Short timeout
            resp = client._request("GET", f"api/v1/dataset/{i}", timeout=5)
            if resp.ok:
                ds = resp.json().get("result", {})
                db_id = ds.get("database", {}).get("id")
                print(f"  - [PROBE VALID] ID: {ds.get('id')} | Name: {ds.get('table_name')} | DB: {db_id}")
                found_any = True
            else:
                print(f"  - [PROBE FAIL] ID {i}: {resp.status_code}")
        except Exception as e:
            print(f"  - [PROBE ERROR] ID {i}: {e}")
            
    if not found_any:
        print("Probe returned no results.")

    # 3. Test DB Connection
    print("\n[3] Testing Direct DB Connection...")
    try:
        conn = client._get_db_connection()
        print("DB Connection Successful!")
        cur = conn.cursor()
        cur.execute("SELECT id, table_name, database_id FROM tables")
        rows = cur.fetchall()
        print(f"DB Tables Found: {len(rows)}")
        for r in rows:
            print(f"  - DB Row: ID={r[0]}, Name={r[1]}, DB_ID={r[2]}")
        conn.close()
    except Exception as e:
        print(f"DB Connection Failed: {e}")

if __name__ == "__main__":
    run_debug()
