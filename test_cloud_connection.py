import requests
import os
from dotenv import load_dotenv

# Load env to get credentials
load_dotenv()

# HARDCODE THE CLOUDFLARE URL TO TEST IT EXPLICITLY
PUBLIC_URL = "https://prot-analog-thousands-drilling.trycloudflare.com"
USERNAME = os.getenv("SUPERSET_USERNAME", "admin")
PASSWORD = os.getenv("SUPERSET_PASSWORD", "admin")

def test_connection():
    print(f"Testing connection to: {PUBLIC_URL}")
    
    session = requests.Session()
    
    # 1. Login
    login_url = f"{PUBLIC_URL}/api/v1/security/login"
    try:
        print(f"Attempting Login to {login_url}...")
        resp = session.post(login_url, json={
            "username": USERNAME, 
            "password": PASSWORD, 
            "provider": "db"
        }, timeout=10)
        
        print(f"Login Status: {resp.status_code}")
        if not resp.ok:
            print(f"Login Failed: {resp.text}")
            return
            
        token = resp.json().get("access_token")
        print("Login Successful! Token obtained.")
        
        # 2. Get Guest Token (Simulate Streamlit App)
        print("Attempting to fetch Guest Token...")
        guest_url = f"{PUBLIC_URL}/api/v1/security/guest_token/"
        headers = {"Authorization": f"Bearer {token}"}
        
        guest_payload = {
            "user": {"username": "guest", "first_name": "Test", "last_name": "Guest"},
            "resources": [{"type": "dashboard", "id": "test-id"}], # ID doesn't need to exist for 403 test
            "rls": []
        }
        
        resp = session.post(guest_url, json=guest_payload, headers=headers, timeout=10)
        print(f"Guest Token Status: {resp.status_code}")
        print(f"Guest Token Response: {resp.text}")
        
    except Exception as e:
        print(f"CRITICAL FAILURE: {e}")

if __name__ == "__main__":
    test_connection()
