import subprocess

def search_logs():
    try:
        # Get logs from superset service
        result = subprocess.run(['docker-compose', 'logs', '--tail=1000', 'superset'], 
                               capture_output=True, text=True, cwd='superset')
        logs = result.stdout
        
        print("--- SEARCHING FOR 403 ERRORS ---")
        lines = logs.split('\n')
        for i, line in enumerate(lines):
            if '403' in line:
                print(f"MATCH AT LINE {i}: {line}")
                # Print 10 lines around the match
                start = max(0, i - 5)
                end = min(len(lines), i + 15)
                for l in lines[start:end]:
                    print(f"  {l}")
                print("-" * 20)
                
        print("\n--- SEARCHING FOR TRACEBACKS ---")
        for i, line in enumerate(lines):
            if 'Traceback' in line:
                print(f"TRACEBACK AT LINE {i}: {line}")
                end = min(len(lines), i + 30)
                for l in lines[i:end]:
                    print(f"  {l}")
                print("-" * 20)
                
    except Exception as e:
        print(f"Error reading logs: {e}")

if __name__ == "__main__":
    search_logs()
