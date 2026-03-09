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
            "plan": plan
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

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
            # Mapping to actual Superset viz types
            viz_map = {
                "dist_bar": "echarts_timeseries_bar", 
                "bar": "echarts_timeseries_bar",
                "line": "echarts_timeseries_line",
                "pie": "pie",
                "big_number_total": "big_number_total"
            }
            actual_viz = viz_map.get(chart["viz_type"], chart["viz_type"])
            
            # Param construction
            params = {
                "datasource": f"{dataset_id}__table",
                "viz_type": actual_viz,
            }

            # Metric logic
            metric_col = chart["metric"]
            if str(metric_col).lower() == "count":
                params["metrics"] = ["count"]
            else:
                metric_obj = {
                    "expressionType": "SIMPLE", 
                    "column": {"column_name": metric_col}, 
                    "aggregate": chart.get("agg_func", "SUM"), 
                    "label": chart["title"]
                }
                params["metrics"] = [metric_obj]

            # Handle Grouping
            group_by = chart.get("group_by")
            if group_by:
                if actual_viz in ["echarts_timeseries_bar", "echarts_timeseries_line"]:
                    # These newer ECharts plugins expect x_axis
                    params["x_axis"] = group_by
                    params["time_grain_sqla"] = "P1D" 
                elif actual_viz == "pie":
                    params["groupby"] = [group_by]
                else:
                    params["groupby"] = [group_by]
            
            # Extra fields often needed by ECharts
            if "echarts" in actual_viz:
                params["y_axis_format"] = "SMART_NUMBER"
                params["seriesType"] = "scatter" if actual_viz == "echarts_timeseries_scatter" else "line"
            
            c_resp = sup.create_chart(dataset_id, chart.get("title", "AI Chart"), actual_viz, params)
            created_chart_ids.append(c_resp.get("id"))
            
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
            actual_viz = "echarts_timeseries_bar" if viz_type == "dist_bar" else ("echarts_timeseries_line" if viz_type == "line" else viz_type)
            if actual_viz == "pie": actual_viz = "pie"
            elif actual_viz == "big_number_total": actual_viz = "big_number_total"
            
            params = {
                "datasource": f"{dataset_id}__table",
                "viz_type": actual_viz,
            }

            metric_col = result.get("metric", "count")
            if str(metric_col).lower() == "count":
                params["metrics"] = ["count"]
            else:
                metric_obj = {
                    "expressionType": "SIMPLE", 
                    "column": {"column_name": metric_col}, 
                    "aggregate": result.get("agg_func", "SUM"), 
                    "label": result.get("title", "AI Chart")
                }
                params["metrics"] = [metric_obj]

            group_by = result.get("group_by")
            if group_by:
                if actual_viz in ["echarts_timeseries_bar", "echarts_timeseries_line"]:
                    params["x_axis"] = group_by
                    params["time_grain_sqla"] = "P1D" 
                else:
                    params["groupby"] = [group_by]
            
            if "echarts" in actual_viz:
                params["y_axis_format"] = "SMART_NUMBER"
                params["seriesType"] = "scatter" if actual_viz == "echarts_timeseries_scatter" else "line"
            
            c_resp = sup.create_chart(dataset_id, result.get("title", "AI Chart"), actual_viz, params)
            new_chart_id = c_resp.get("id")
            
            # Append to existing dashboard
            sup.append_chart_to_dashboard(dashboard_id, new_chart_id)
            
            # Switch action so the frontend knows it was automatically added
            result["action"] = "chart_added_to_dashboard"
            result["text"] = f"### ✅ Chart Added!\n\nI have created the chart **{result.get('title')}** and added it to your dashboard."
            result["chart_url"] = sup.chart_url(new_chart_id)
            result["new_chart_id"] = new_chart_id # Pass this if needed
        
        # Update history
        session["messages"].append({"role": "user", "content": prompt})
        
        # Avoid empty content strings which crash Gemini
        assistant_content = result.get("text")
        if not assistant_content:
            if result.get("action") == "create_chart":
                assistant_content = f"I've planned a chart: {result.get('title', 'Chart')}"
            else:
                assistant_content = "Understood."
                
        session["messages"].append({"role": "assistant", "content": assistant_content})
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
