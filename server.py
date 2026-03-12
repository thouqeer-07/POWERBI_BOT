import os
import json
import uuid
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from dotenv import load_dotenv

load_dotenv()

from ai_manager import get_llama_suggestions, handle_chat_prompt
from superset_client import SupersetClient

app = FastAPI(title="BI BOT API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DB_URI = os.getenv("DB_URI", "postgresql://superset:superset_password@localhost:5432/superset")
SUPERSET_URL = os.getenv("SUPERSET_URL", "http://localhost:8088")
SUPERSET_PUBLIC_URL = os.getenv("SUPERSET_PUBLIC_URL", "http://localhost:8088")

# Initialize Superset Client
sup = SupersetClient(api_url=SUPERSET_URL, public_url=SUPERSET_PUBLIC_URL)

# In-memory session state (simplification for prototype)
# In production, use Redis or a database
# Global mapping for visualization types
VIZ_MAP = {
    "dist_bar": "echarts_timeseries_bar", 
    "bar": "echarts_timeseries_bar",
    "line": "echarts_timeseries_line",
    "pie": "pie",
    "big_number_total": "big_number_total"
}

SESSIONS = {}

@app.get("/health")
async def health():
    return {"status": "ok", "superset": "connected"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), table_name: str = Form(...)):
    try:
        content = await file.read()
        filename = file.filename
        
        if filename.endswith(".csv"):
            from io import StringIO
            df = pd.read_csv(StringIO(content.decode("utf-8")))
        elif filename.endswith(".xlsx"):
            from io import BytesIO
            df = pd.read_excel(BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        # Save to Postgres
        engine = create_engine(DB_URI)
        df.to_sql(table_name, engine, if_exists="replace", index=False)
        
        # Register in Superset
        db_id = sup.get_database_id("Supabase_Cloud") or 1
        dataset = sup.create_dataset(database_id=db_id, schema="public", table_name=table_name)
        
        # Analyze with AI
        plan = get_llama_suggestions(df, table_name)
        
        session_id = str(uuid.uuid4())
        SESSIONS[session_id] = {
            "df": df,
            "table_name": table_name,
            "dataset_id": dataset.get("id"),
            "db_id": db_id,
            "messages": []
        }
        
        return {
            "session_id": session_id,
            "table_name": table_name,
            "dataset_id": dataset.get("id"),
            "plan": plan,
            "columns": df.columns.tolist()
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

def build_chart_params(dataset_id, chart_plan, actual_viz):
    """
    Consolidated helper to build Superset-compatible chart parameters.
    Fixes common issues like Pie chart orderby and Big Number undefined.
    """
    params = {
        "datasource": f"{dataset_id}__table",
        "viz_type": actual_viz,
    }

    # Metric construction
    metric_col = chart_plan.get("metric", "count")
    agg = chart_plan.get("agg_func", "SUM").upper()
    
    # CRITICAL: Always use a structured metric object even for counts
    # This prevents 'Field may not be null' errors in sorting/orderby
    if str(metric_col).lower() == "count":
        metric_obj = {
            "expressionType": "SQL",
            "sqlExpression": "COUNT(*)",
            "label": "COUNT(*)"
        }
    else:
        metric_col = str(metric_col)
        if agg not in ["SUM", "AVG", "COUNT", "MAX", "MIN"]:
            agg = "SUM"
            
        metric_obj = {
            "expressionType": "SIMPLE", 
            "column": {"column_name": metric_col}, 
            "aggregate": agg, 
            "label": f"{agg}({metric_col})"
        }

    # Superset handles metrics differently per viz type
    params["metrics"] = [metric_obj]
    
    # Pie charts and some Big Number versions need a singular 'metric' field
    if actual_viz in ["big_number_total", "pie"]:
        params["metric"] = metric_obj 

    # Handle Grouping
    group_by = chart_plan.get("group_by")
    if group_by:
        if "echarts_timeseries" in actual_viz:
            params["x_axis"] = group_by
            # ONLY set time grain if it looks like a time dimension
            is_temporal = any(k in str(group_by).lower() for k in ["date", "time", "year", "month", "day"])
            if is_temporal:
                params["time_grain_sqla"] = "P1D"
            else:
                # For categorical data on echarts_timeseries charts
                params["time_grain_sqla"] = None
                params["series_limit"] = 100 
        
        elif actual_viz == "pie":
            params["groupby"] = [group_by]
            # Use the EXACT same metric object for sorting
            params["orderby"] = [[metric_obj, False]] 
            params["timeseries_limit_metric"] = metric_obj
        else:
            params["groupby"] = [group_by]
            params["orderby"] = [[metric_obj, False]]
    
    # Static parameters for ECharts plugins
    if "echarts" in actual_viz:
        params["y_axis_format"] = "SMART_NUMBER"
        params["seriesType"] = "scatter" if actual_viz == "echarts_timeseries_scatter" else "line"
        params["show_legend"] = True
        params["rich_tooltip"] = True

    return params

@app.post("/create-dashboard")
async def create_dashboard(session_id: str = Form(...), plan: str = Form(...)):
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
        session = SESSIONS[session_id]
        dataset_id = session["dataset_id"]
        table_name = session["table_name"]
        charts_plan = json.loads(plan)
        
        created_chart_ids = []
        for chart in charts_plan:
            try:
                # Mapping to actual Superset viz types
                actual_viz = VIZ_MAP.get(chart["viz_type"], chart["viz_type"])
                
                # Use helper for param construction
                params = build_chart_params(dataset_id, chart, actual_viz)
                
                print(f"DEBUG: Creating chart '{chart.get('title')}' with params: {params}")
                c_resp = sup.create_chart(dataset_id, chart.get("title", "AI Chart"), actual_viz, params)
                if c_resp and c_resp.get("id"):
                    created_chart_ids.append(c_resp.get("id"))
                else:
                    print(f"WARNING: Chart creation failed for '{chart.get('title')}': No ID returned")
            except Exception as chart_err:
                print(f"ERROR: Failed to create chart '{chart.get('title')}': {chart_err}")
                continue
            
        dash_name = f"Dashboard - {table_name}"
        dash = sup.create_dashboard(dash_name)
        dash_id = dash.get("id")
        sup.add_charts_to_dashboard(dash_id, created_chart_ids)
        
        return {
            "dashboard_id": dash_id,
            "dashboard_url": sup.dashboard_url(dash_id)
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete-dashboard/{dashboard_id}")
async def delete_dashboard(dashboard_id: int):
    try:
        sup.delete_dashboard(dashboard_id)
        return {"result": "success"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/datasets")
async def get_datasets():
    try:
        datasets = sup.list_datasets()
        # Transform or filter if necessary, but for now return as is
        return datasets
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: int):
    try:
        sup.delete_dataset(dataset_id)
        return {"result": "success"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/datasets/{dataset_id}/data")
async def get_dataset_data(dataset_id: int):
    try:
        print(f"DEBUG: Fetching data for dataset ID: {dataset_id}")
        # 1. Find the table name for this dataset
        datasets = sup.list_datasets()
        target_ds = next((ds for ds in datasets if str(ds.get("id")) == str(dataset_id)), None)
        
        if not target_ds:
            print(f"ERROR: Dataset ID {dataset_id} not found in available datasets: {[d.get('id') for d in datasets]}")
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        table_name = target_ds.get("table_name")
        print(f"DEBUG: Dataset ID {dataset_id} mapped to table name: {table_name}")
        
        if not table_name:
            raise HTTPException(status_code=400, detail="Table name not found for this dataset")
            
        # 2. Fetch data from the table
        data = sup.get_table_data(table_name)
        print(f"DEBUG: Fetched {len(data.get('rows', []))} rows for table {table_name}")
        return data
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(
    session_id: str = Form(...), 
    prompt: str = Form(...),
    dashboard_id: int = Form(default=None)
):
    if session_id not in SESSIONS:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session = SESSIONS[session_id]
    dataset_id = session["dataset_id"]
    try:
        # Re-using handle_chat_prompt
        # Note: We need to adapt this to handle history correctly in the API context
        history_tuple = tuple(session["messages"])
        result = handle_chat_prompt(
            prompt, 
            dataset_id, 
            session["table_name"], 
            df_serialized=session["df"],
            messages_history_tuple=history_tuple
        )
        
        # Auto-create chart from chat if needed
        if result.get("action") == "create_chart" and dashboard_id:
            viz_type = result.get("viz_type", "dist_bar")
            actual_viz = VIZ_MAP.get(viz_type, viz_type)
            if actual_viz == "pie": actual_viz = "pie"
            elif actual_viz == "big_number_total": actual_viz = "big_number_total"
            
            # Use helper for param construction
            params = build_chart_params(dataset_id, result, actual_viz)
            
            try:
                print(f"DEBUG: Creating chat chart '{result.get('title')}'...")
                c_resp = sup.create_chart(dataset_id, result.get("title", "AI Chart"), actual_viz, params)
                new_chart_id = c_resp.get("id")
                
                # Append to existing dashboard
                sup.append_chart_to_dashboard(dashboard_id, new_chart_id)
                
                # Switch action so the frontend knows it was automatically added
                result["action"] = "chart_added_to_dashboard"
                result["text"] = f"### ✅ Chart Added!\n\nI have created the chart **{result.get('title')}** and added it to your dashboard."
                result["chart_url"] = sup.chart_url(new_chart_id)
                result["new_chart_id"] = new_chart_id # Pass this if needed
            except Exception as chart_err:
                print(f"ERROR: Chat chart creation failed: {chart_err}")
                result["action"] = "answer"
                result["text"] = f"### ❌ Chart Creation Failed\n\nI tried to create the chart **{result.get('title')}**, but encountered an error: {str(chart_err)}"
        
        # Update history
        session["messages"].append({"role": "user", "content": prompt})
        
        # Avoid empty content strings which crash Gemini or confuse Llama
        assistant_content = result.get("text")
        if not assistant_content:
            if result.get("action") == "create_chart":
                assistant_content = f"### 📊 Chart Created: {result.get('title', 'AI Chart')}\n\nI have successfully planned a new visualization for you."
            else:
                assistant_content = "### ✅ Request Processed\n\nI have processed your request. How else can I assist you with your data today? 🚀"
                
        session["messages"].append({"role": "assistant", "content": assistant_content})
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
