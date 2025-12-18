# Apache Superset Chatbot Prototype

This prototype accepts natural language prompts (via Streamlit or Flask endpoints), asks Google Gemini for intent parsing, and uses the Apache Superset REST API to create dataset metadata, charts, and dashboards (best-effort prototype).

Quick overview
- `streamlit_app.py`: Streamlit UI to upload CSV, ask a natural prompt, and (best-effort) create Superset dataset metadata pointing to existing DB tables.
- `app.py`: Flask API endpoints (`/chat` and `/export/<id>`) that parse prompts and optionally create Superset dataset metadata.
- `superset_client.py`: Minimal helper to authenticate with Superset (API key or username/password) and call dataset/chart/dashboard endpoints.
- `gemini_client.py`: Lightweight wrapper to call Gemini using an API key.

Limitations
- Superset does not accept arbitrary row pushes via its public REST API; it expects datasets to point to tables in an underlying database that Superset can access. This prototype creates dataset metadata entries that reference an existing table. If you need CSV ingestion, load the CSV into a database table that Superset already has a connection to, then create dataset metadata via this app.
- Superset API shapes vary across versions; you may need to adapt `superset_client.py` payloads for your Superset version.

Setup
1. Create a `.env` from `.env.example` and fill values for `SUPERSET_URL`, authentication method, `SUPERSET_DATABASE_ID` (optional), and `GEMINI_API_KEY`.

2. Create and activate a virtual environment and install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Running the Streamlit UI

```powershell
streamlit run streamlit_app.py
```

Running the Flask API

```powershell
$env:FLASK_APP='app.py'; $env:FLASK_ENV='development'; flask run
```

Usage notes
- To create a Superset dataset via the UI, first upload your CSV into a database table that Superset can access. Then provide the DB table name and `database_id` in the Streamlit UI to create dataset metadata.
- The `/chat` endpoint returns a suggested SQL for the parsed prompt and can create dataset metadata if you provide `dataset.table_name` and `dataset.database_id` in the JSON payload.

Next steps I can help with
- Add CSV ingestion into a database (Postgres/MySQL) from the Streamlit UI and automatically register the table in Superset (requires DB credentials and network access).
- Create charts/dashboards programmatically after dataset creation, and attempt to arrange charts in dashboards (may require adapting to your Superset version).
- Improve Gemini prompts and parsing for more accurate visuals.

