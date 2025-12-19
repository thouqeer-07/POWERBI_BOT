import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

# Use localhost for reliable local testing
URL = "http://localhost:8088"
USERNAME = os.getenv("SUPERSET_USERNAME") or "admin"
PASSWORD = os.getenv("SUPERSET_PASSWORD") or "admin"

def get_token():
    payload = {"password": PASSWORD, "provider": "db", "username": USERNAME}
    r = requests.post(f"{URL.rstrip('/')}/api/v1/security/login", json=payload)
    r.raise_for_status()
    return r.json()["access_token"]

def list_dbs(token):
    headers = {"Authorization": f"Bearer {token}", "ngrok-skip-browser-warning": "true"}
    # Use explicit trailing slash
    r = requests.get(f"{URL.rstrip('/')}/api/v1/database/", headers=headers)
    print(f"Status Code: {r.status_code}")
    if r.status_code != 200:
        print(f"Error Response: {r.text}")
        return
    data = r.json()
    print("Databases found:")
    for db in data.get("result", []):
        print(f" - ID {db['id']}: {db['database_name']} (Backend: {db.get('backend')})")

try:
    token = get_token()
    list_dbs(token)
except Exception as e:
    print(f"Error: {e}")
