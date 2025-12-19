import psycopg2
import sys

# PASTE YOUR URI HERE
# Direct URI (Wait: this is the Pooler Host but using Wrong Port 5432)
# The user provided: postgresql://postgres.fqsbogzwdkskktmgloui:[PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
# I will fix it to 6543.

POOLER_URI = "postgresql://postgres.fqsbogzwdkskktmgloui:Thouqeer07supbase@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"

def test_connection(uri, name):
    try:
        print(f"--- Testing {name} ---")
        print(f"Connecting to: {uri.split('@')[-1]}") 
        conn = psycopg2.connect(uri, connect_timeout=10)
        print(f"✅ SUCCESS: {name} established!")
        conn.close()
        return True
    except Exception as e:
        print(f"❌ FAILURE {name}: {e}")
        return False

if __name__ == "__main__":
    if "YOUR-POOLER-HOST" in POOLER_URI:
        print("Please edit this file and paste your actual Pooler URI from Supabase Settings.")
    else:
        success = test_connection(POOLER_URI, "Pooler Connection (6543)")
        if not success:
            print("\n💡 Pooler connection failed. Check your Supabase settings.")
            print("1. Ensure 'Connection Pooler' is ON in Supabase Settings -> Database.")
            print("2. Ensure Mode is set to 'Session'.")
            print("3. Check 'IPv4 Allow List' / Network Restrictions.")
