import streamlit as st
DEBUG = False  # Set to True to enable debug prints
import streamlit.components.v1 as components
import re
import time
import os

# --- Helper for Typewriter Effect ---
def stream_data(text, delay=0.02):
    for word in text.split(" "):
        yield word + " "
        time.sleep(delay)
import json
import difflib
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
import requests
from huggingface_hub import InferenceClient

# Load environment variables
load_dotenv()

# HuggingFace configuration
# Prioritize st.secrets (Cloud), fallback to os.getenv (Local)
HF_TOKEN = st.secrets.get("HUGGINGFACE_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
LLAMA_MODEL_ID = st.secrets.get("LLAMA_MODEL_ID") or os.getenv("LLAMA_MODEL_ID", "meta-llama/Meta-Llama-3-8B-Instruct")
client = InferenceClient(model=LLAMA_MODEL_ID, token=HF_TOKEN)

from superset_client import SupersetClient

# Database connection string
# Prioritize st.secrets (Cloud), fallback to os.getenv (Local, or .env), fallback to default
DB_URI = st.secrets.get("DB_URI") or os.getenv("DB_URI") or "postgresql://superset:superset_password@localhost:5432/superset"

# URI for Superset container to reach the DB container (replace localhost with service name 'db')
# If we are tunneling, DOCKER_DB_URI might not be relevant for this client script, 
# but for internal container talk (if this script ran in container). 
# For now, keep the logic but base it on the default if not provided.
if "localhost" in DB_URI:
    DOCKER_DB_URI = DB_URI.replace("localhost", "db")
else:
    DOCKER_DB_URI = DB_URI # Use as-is if external

# Initialize Superset Client
@st.cache_resource
def get_superset_client():
    # Fetch public URL from secrets if available
    public_url = st.secrets.get("SUPERSET_PUBLIC_URL") or os.getenv("SUPERSET_PUBLIC_URL")
    return SupersetClient(superset_url=public_url)

try:
    sup = get_superset_client()
except Exception as e:
    st.error(f"Failed to initialize Superset Client: {e}")
    st.stop()

@st.cache_data(ttl=3600, show_spinner=False)
def get_cached_database_id(db_name):
    """Cache the database ID lookup to avoid repeated API calls on startup."""
    return sup.get_database_id(db_name)

def render_fullscreen_iframe(url, height=800):
    """Render an iframe with a custom Full Screen toggle button."""
    
    # If a public URL is configured (e.g. via ngrok), replace the internal URL domain
    # User requested specific public URL:
    # Prioritize st.secrets (Cloud), fallback to os.getenv (Local)
    public_url_base = st.secrets.get("SUPERSET_PUBLIC_URL") or os.getenv("SUPERSET_PUBLIC_URL", "https://nonhallucinatory-meetly-sharika.ngrok-free.dev")
    if public_url_base:
        # Assuming 'url' starts with the internal http://localhost:8088 or similar
        # We replace the base part. A simple replace of the internal base is safest if known,
        # otherwise we can parse.
        internal_base = sup.superset_url
        if internal_base in url:
            url = url.replace(internal_base, public_url_base.rstrip("/"))
            if DEBUG:
                print(f"DEBUG: Swapped iframe URL to public: {url}")

    html_code = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .container {{
                position: relative;
                width: 100%;
                height: {height}px;
            }}
            iframe {{
                width: 100%;
                height: 100%;
                border: none;
            }}
            .fullscreen-btn {{
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 1000;
                background-color: #ff4b4b;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                cursor: pointer;
                font-family: sans-serif;
                font-weight: bold;
                opacity: 0.8;
                transition: opacity 0.3s;
            }}
            .fullscreen-btn:hover {{
                opacity: 1;
            }}
        </style>
    </head>
    <body>
        <div class="container" id="dash-container-{url.__hash__()}">
            <button class="fullscreen-btn" onclick="toggleFullScreen()">&#x26F6; Full Screen</button>
            <iframe src="{url}?standalone=true&show_filters=0&expand_filters=0" allowfullscreen></iframe>
        </div>
        <script>
            function toggleFullScreen() {{
                var elem = document.getElementById("dash-container-{url.__hash__()}");
                if (!document.fullscreenElement) {{
                    if (elem.requestFullscreen) {{
                        elem.requestFullscreen();
                    }} else if (elem.webkitRequestFullscreen) {{ /* Safari */
                        elem.webkitRequestFullscreen();
                    }} else if (elem.msRequestFullscreen) {{ /* IE11 */
                        elem.msRequestFullscreen();
                    }}
                }} else {{
                    if (document.exitFullscreen) {{
                        document.exitFullscreen();
                    }} else if (document.webkitExitFullscreen) {{ /* Safari */
                        document.webkitExitFullscreen();
                    }} else if (document.msExitFullscreen) {{ /* IE11 */
                        document.msExitFullscreen();
                    }}
                }}
            }}
        </script>
    </body>
    </html>
    """
    components.html(html_code, height=height, scrolling=False)

import time


def get_llama_suggestions(df, table_name, retries=3):
    """Ask Llama 3 for a list of charts based on the dataframe columns using HuggingFace Inference API."""
    if not HF_TOKEN:
        st.warning("HuggingFace token not set. Llama suggestions disabled.")
        return []
    # Prepare column info
    col_info = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        sample = str(df[col].head(3).tolist())
        col_info.append(f"- {col} ({dtype}): e.g., {sample}")
    col_text = "\n".join(col_info)

    system_prompt = f"""
You are an expert Data Analyst and Visualization Architect.
I have a dataset '{table_name}' with the following columns:
{col_text}

Your goal is to suggest 4-6 diverse, meaningful, and accurate visualizations to summarize this data.
- Analyze the column names and data types to understand the semantic meaning (e.g., time, category, money).
- Suggest charts that reveal key insights, trends, or distributions.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON array of objects.
2. "viz_type" MUST be strictly one of: ["dist_bar", "pie", "line", "big_number_total"].
   - Use "dist_bar" for categorical comparisons or time-series bars.
   - Use "line" ONLY if there is a clear time series or ordered numerical x-axis.
   - Use "pie" for part-to-whole comparisons (few categories).
   - Use "big_number_total" for single aggregate metrics (e.g. Total Revenue).
3. "agg_func" MUST be one of: ["SUM", "AVG", "COUNT", "MAX", "MIN"].
4. Ensure "metric" is a numeric column (or "count").
5. valid JSON only. No markdown formatting, no conversational text.

Example JSON output structure:
[
  {{
    "title": "Revenue by Region",
    "viz_type": "dist_bar",
    "metric": "sales_amount",
    "group_by": "region",
    "agg_func": "SUM"
  }}
]
"""
    for attempt in range(retries):
        try:
            # Use chat_completion for conversational Llama models
            response = client.chat_completion(messages=[{"role": "user", "content": system_prompt}], max_tokens=500)
            if hasattr(response, "choices"):
                text = response.choices[0].message.content.strip()
            else:
                text = response.get("generated_text", "").strip()
            
            # Extract JSON array using regex
            match = re.search(r'\[.*\]', text, re.DOTALL)
            if match:
                text = match.group(0)
            
            plans = json.loads(text)
            validated_plans = []
            valid_cols = set(df.columns)
            
            for p in plans:
                # Sanitize strings
                if str(p.get("group_by")).lower() in ["null", "none", ""]:
                    p["group_by"] = None
                
                # Default title
                if not p.get("title"):
                    p["title"] = f"{p.get('viz_type', 'Chart')} of {p.get('metric', 'data')}"

                # Validate Metric
                if p.get("metric") != "count" and p.get("metric") not in valid_cols:
                    p["metric"] = "count" # Fallback
                
                # Validate Group By
                if p.get("group_by") and p.get("group_by") not in valid_cols:
                    # Attempt to find a valid object/category column
                    cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
                    if cat_cols:
                        p["group_by"] = cat_cols[0]
                    else:
                        p["group_by"] = None

                validated_plans.append(p)

            return validated_plans
        except Exception as e:
            if attempt == retries - 1:
                st.error(f"Llama suggestion failed (Final Attempt): {e}")
                st.error("Hugging Face API is experiencing issues. Please try again later.")
                return []
            else:
                st.warning(f"Llama suggestion failed (Attempt {attempt+1}/{retries}). Retrying... Error: {e}")
            time.sleep(2 ** attempt)
    return []

st.title("Superset AI Assistant")

# Sidebar for File Upload
with st.sidebar:
    st.header("Data Upload")
    # Try to find the 'Supabase_Cloud' database automatically (using session_state to avoid redundant API calls)
    if "superset_db_id" not in st.session_state:
        # Use cached lookup for speed (instant if previously found)
        db_id = get_cached_database_id("Supabase_Cloud")
        if db_id:
            st.session_state["superset_db_id"] = db_id
        else:
            with st.spinner("Connecting Superset to Database..."):
                try:
                    # Use DOCKER_DB_URI so Superset (in Docker) can reach the DB
                    sup.add_database("Supabase_Cloud", DOCKER_DB_URI)
                    st.success("Successfully added 'Supabase_Cloud' database to Superset!")
                    time.sleep(1) # Wait a moment for consistency
                    db_id = sup.get_database_id("Supabase_Cloud")
                    if db_id:
                        st.session_state["superset_db_id"] = db_id
                except Exception as e:
                    # If auto-connect fails, do not stop the app. Just warn and let fallback handling take over.
                    print(f"Auto-connect warning: {e}")
                    # Check if we can just assume it worked or is redundant
                    if "already exists" in str(e):
                         st.session_state["superset_db_id"] = 1
                         # Success message will be shown below by the main check
                    else:
                         st.warning(f"Could not auto-connect database: {e}. Using manual selection below.")
    
    db_id = st.session_state.get("superset_db_id")

    if db_id:
        # Verify connection
        st.success(f"Connected to Superset Database ID: {db_id}")
    else:
        # Fallback: list all databases
        db_list = None
        try:
            db_resp = sup.list_databases()
            db_list = db_resp.get("result") if isinstance(db_resp, dict) else None
        except Exception as e:
            st.write(f"Could not list Superset DBs: {e}")
        if db_list:
            options = [f"{d.get('id')} - {d.get('database_name')}" for d in db_list]
            choice = st.selectbox("Choose Superset database", options)
            db_id = int(choice.split(" - ")[0])
        else:
            default_db = getattr(sup, "database_id", None) or 1
            db_id = st.number_input("Superset database id", value=int(default_db), min_value=1)
    if db_id:
        st.session_state["superset_db_id"] = db_id
    uploaded_file = st.file_uploader("Upload CSV or Excel", type=["csv", "xlsx"])
    if uploaded_file:
        # Load dataframe into session state if not present (persistence across reruns)
        if "current_dataframe" not in st.session_state:
            try:
                if uploaded_file.name.endswith(".csv"):
                    df_preview = pd.read_csv(uploaded_file)
                else:
                    df_preview = pd.read_excel(uploaded_file)
                st.session_state["current_dataframe"] = df_preview
            except Exception:
                pass

        table_name = st.text_input("Table Name", value=uploaded_file.name.split(".")[0].lower().replace(" ", "_").replace("-", "_"))
        upload_clicked = st.button("Upload to Database")

if 'upload_clicked' in locals() and upload_clicked and uploaded_file:
    try:
        if uploaded_file.name.endswith(".csv"):
            df = pd.read_csv(uploaded_file)
        else:
            df = pd.read_excel(uploaded_file)
        engine = create_engine(DB_URI)
        df.to_sql(table_name, engine, if_exists="replace", index=False)
        st.success(f"Successfully uploaded `{table_name}` to database!")
        try:
            dataset = sup.create_dataset(database_id=db_id, schema="public", table_name=table_name)
            st.success(f"Created Superset dataset: `{table_name}`")
            st.session_state["current_table"] = table_name
            st.session_state["current_dataset_id"] = dataset.get("id")
            st.session_state["current_dataframe"] = df  # Store dataframe for chat context
            with st.spinner("🤖 AI is analyzing your dataset..."):
                plan = get_llama_suggestions(df, table_name)
            st.session_state["dashboard_plan"] = plan
            # Remove st.rerun() here - let Streamlit update the UI naturally on next script execution
            # Since we just updated session_state, the next block will see it.
        except Exception as e:
            st.warning(f"Uploaded to DB but failed to create Superset dataset: {e}")
    except Exception as e:
        st.error(f"Failed to upload file: {e}")

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []


# --- Dashboard Generation UI (Moved to Top) ---
# --- Dashboard Generation UI (State Machine) ---
if "dashboard_plan" in st.session_state:
    with st.expander("📊 Review Dashboard Plan", expanded=True):
        
        # ---------------------------------------------------------
        # STATE 1: SUCCESS (Dashboard Created)
        # ---------------------------------------------------------
        if st.session_state.get("waiting_for_dashboard_confirmation"):
            st.header("✅ Dashboard Created!")
            st.write("Please review the dashboard below.")
            dash_url = st.session_state.get("created_dashboard_url")
            render_fullscreen_iframe(dash_url, height=800)
            
            c1, c2 = st.columns(2)
            if c1.button("Confirm & Keep"):
                 msg = f"I've created a new dashboard! You can view it here: [Dashboard Link]({dash_url})"
                 st.session_state.messages.append({"role": "assistant", "content": msg, "chart_url": dash_url})
                 
                 # Cleanup State
                 del st.session_state["dashboard_plan"]
                 del st.session_state["waiting_for_dashboard_confirmation"]
                 if "pending_dashboard_plan" in st.session_state: del st.session_state["pending_dashboard_plan"]
                 if "is_building_dashboard" in st.session_state: del st.session_state["is_building_dashboard"]
                 
                 st.success("Dashboard finalized!")
                 st.rerun()
            
            if c2.button("Reject & Delete"):
                 dash_id = st.session_state.get("created_dashboard_id")
                 try:
                    sup.delete_dashboard(dash_id)
                    st.warning("Dashboard deleted. You can modify the plan below.")
                 except Exception as e:
                    st.error(f"Failed to delete dashboard: {e}")
                 
                 del st.session_state["waiting_for_dashboard_confirmation"]
                 st.rerun()

        # ---------------------------------------------------------
        # STATE 2: BUILDING (Processing - No Form Visible)
        # ---------------------------------------------------------
        elif st.session_state.get("is_building_dashboard"):
             status = st.status("Building Dashboard...", expanded=True)
             try:
                 # Clean up temp state instantly to prevent stuck loop
                 if "is_building_dashboard" in st.session_state: del st.session_state["is_building_dashboard"]
                 
                 updated_plan = st.session_state.get("pending_dashboard_plan", [])
                 dataset_id = st.session_state.get("current_dataset_id")
                 db_id = st.session_state.get("superset_db_id")
                 table_name = st.session_state.get("current_table")
                 
                 if not dataset_id:
                     try:
                         ds = sup.create_dataset(database_id=db_id, schema="public", table_name=table_name)
                         dataset_id = ds.get("id")
                     except Exception as e:
                         status.error(f"Could not ensure dataset: {e}")
                         st.stop()
                 
                 created_chart_ids = []
                 for chart in updated_plan:
                     status.write(f"Creating chart: {chart['title']}...")
                     viz_map = {
                         "dist_bar": "echarts_timeseries_bar", 
                         "bar": "echarts_timeseries_bar",
                         "line": "echarts_timeseries_line",
                         "pie": "pie",
                         "big_number_total": "big_number_total"
                     }
                     actual_viz = viz_map.get(chart["viz_type"], chart["viz_type"])
                     params = {
                         "adhoc_filters": [],
                         "row_limit": 100,
                         "datasource": f"{dataset_id}__table",
                         "show_legend": True,
                         "legendOrientation": "top",
                         "legendType": "scroll"
                     }
                     
                     if chart["metric"].lower() == "count":
                         metric_spec = "count"
                     else:
                         metric_spec = {
                             "expressionType": "SIMPLE",
                             "column": {"column_name": chart["metric"]},
                             "aggregate": chart["agg_func"],
                             "label": f"{chart['agg_func']} of {chart['metric']}"
                         }
                     
                     if actual_viz == "big_number_total":
                         params["metric"] = metric_spec
                         params["subheader"] = ""
                     elif actual_viz == "pie":
                         params["metric"] = metric_spec
                         if chart.get("group_by"):
                             params["groupby"] = [chart["group_by"]]
                     elif actual_viz in ["echarts_timeseries_bar", "echarts_timeseries_line"]:
                         params["metrics"] = [metric_spec]
                         if chart.get("group_by"):
                             params["groupby"] = []
                             params["x_axis"] = chart["group_by"]
                     else:
                         params["metrics"] = [metric_spec]
                         if chart.get("group_by"):
                             params["groupby"] = [chart["group_by"]]
                     
                     try:
                         c_resp = sup.create_chart(dataset_id, chart["title"], actual_viz, params)
                         created_chart_ids.append(c_resp.get("id"))
                     except Exception as e:
                         status.warning(f"Failed to create chart '{chart['title']}': {e}")
                 
                 if created_chart_ids:
                     status.write("Creating Dashboard container...")
                     dash_name = f"Dashboard - {table_name} ({len(created_chart_ids)} charts)"
                     dash = sup.create_dashboard(dash_name)
                     dash_id = dash.get("id")
                     st.session_state["current_dashboard_id"] = dash_id
                     status.write("Linking charts to dashboard...")
                     sup.add_charts_to_dashboard(dash_id, created_chart_ids)
                     dash_url = sup.dashboard_url(dash_id)
                     status.update(label="Dashboard Created!", state="complete", expanded=False)
                     
                     st.session_state["created_dashboard_id"] = dash_id
                     st.session_state["created_dashboard_url"] = dash_url
                     st.session_state["waiting_for_dashboard_confirmation"] = True
                     st.rerun() 
                 else:
                     status.error("No charts were successfully created.")
             except Exception as e:
                 status.error(f"Process failed: {e}")

        # ---------------------------------------------------------
        # STATE 3: INPUT FORM (Default)
        # ---------------------------------------------------------
        else:
            st.header("📊 Dashboard Plan Review")
            st.write("I've analyzed your data and prepared the following charts. You can edit them before we build the dashboard.")
            plan = st.session_state["dashboard_plan"]
            updated_plan = []
            
            with st.form("dashboard_review_form"):
                for i, chart in enumerate(plan):
                    st.subheader(f"Chart {i+1}")
                    c1, c2, c3 = st.columns(3)
                    with c1:
                        title = st.text_input(f"Title", value=chart.get("title"), key=f"title_{i}")
                    with c2:
                        viz_options = ["dist_bar", "pie", "line", "big_number_total"]
                        default_viz = chart.get("viz_type", "dist_bar")
                        if default_viz not in viz_options:
                            default_viz = "dist_bar"
                        viz = st.selectbox(f"Type", viz_options, index=viz_options.index(default_viz), key=f"viz_{i}")
                    with c3:
                        metric = st.text_input(f"Metric Column", value=chart.get("metric"), key=f"metric_{i}")
                    c4, c5 = st.columns(2)
                    with c4:
                        grp = st.text_input(f"Group By", value=chart.get("group_by") or "", key=f"grp_{i}")
                    with c5:
                        agg_options = ["SUM", "COUNT", "AVG", "MIN", "MAX"]
                        default_agg = chart.get("agg_func", "SUM")
                        if default_agg not in agg_options:
                            default_agg = "SUM"
                        agg = st.selectbox(f"Aggregation", agg_options, index=agg_options.index(default_agg), key=f"agg_{i}")
                    include = st.checkbox(f"Include '{title}'", value=True, key=f"inc_{i}")
                    if include:
                        updated_plan.append({
                            "title": title,
                            "viz_type": viz,
                            "metric": metric,
                            "group_by": grp if grp else None,
                            "agg_func": agg
                        })
                    st.divider()
                submitted = st.form_submit_button("🚀 Create Dashboard")

            if submitted:
                # Transition to Building State
                st.session_state["pending_dashboard_plan"] = updated_plan
                st.session_state["is_building_dashboard"] = True
                st.rerun()



for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        if message.get("chart_url"):
            render_fullscreen_iframe(message["chart_url"], height=400)
        if message.get("show_data"):
             df_view = st.session_state.get("current_dataframe")
             if df_view is not None:
                 st.dataframe(df_view)

# --- Dashboard Generation UI ---

# Chat Logic
def handle_chat_prompt(prompt, dataset_id, table_name, df=None, messages_history=None, retries=3):
    """Interpret user chat prompt using Llama 3 via HuggingFace to either answer questions or create charts."""
    if not HF_TOKEN:
        return {"action": "answer", "text": "HuggingFace token not set. Unable to process request."}
    
    # Generate dataset context
    context_str = ""
    if df is not None:
        try:
            if DEBUG:
                print(f"DEBUG: Generating context for DF with shape {df.shape}")
            row_count = len(df)
            col_info = []
            for col in df.columns:
                dtype = str(df[col].dtype)
                col_info.append(f"- {col} ({dtype})")
            columns_text = "\n".join(col_info)
            sample_data = df.head(3).to_string(index=False)
            context_str = f"""
Dataset Statistics:
- Total Rows: {row_count}
- Columns:
{columns_text}
- Sample Data (first 3 rows):
{sample_data}
"""
            if DEBUG:
                print(f"DEBUG: Context String Length: {len(context_str)}")
            # print(f"DEBUG: Context Content:\n{context_str}") # Uncomment for full context debug
        except Exception as e:
            if DEBUG:
                print(f"DEBUG: Error generating context: {e}")
            context_str = f"Error generating context: {e}"

    system_instruction = f"""
You are an Expert Data Analyst and Visualization Architect.
Your name is 'Superset Assistant', created by Syed Thouqeer Ahmed A.
The user is asking about the dataset '{table_name}'.

{context_str}

### 🎯 YOUR GOAL
Provide insightful, professional, and structured responses. Act like a senior analyst presenting findings.

### 📝 RESPONSE GUIDELINES
1.  **FORMATTING IS CRITICAL:**
    - Use **H3 Headers (###)** to organize sections.
    - Use **Bullet Points** for lists.
    - Use **Bold** for key metrics and column names.
    - Use **Blockquotes (>)** for summaries or key takeaways.
    - Use **Emojis** effectively (📊, 💡, 🔍, ⚠️) to make the text engaging but professional.
2.  **CONTENT STYLE:**
    - **Be Insightful:** Don't just list numbers; explain what they might mean. (e.g., instead of "5 columns", say "The dataset consists of **5 columns**, primarily tracking sales dimensions...").
    - **Be Direct:** Answer specific questions (row counts, column names) immediately using the provided statistics.
    - **Be Proactive:** If the user asks about data, suggest relevant visualizations or analysis steps after your answer.

### ⚠️ CRITICAL INSTRUCTIONS
1.  **PRIORITIZE THE LATEST USER MESSAGE:** The user's LAST message (at the bottom) is your current task. Previous messages are just context.
2.  **STOP & RESET ON GREETINGS:** If the user says "Hi", "Hello", "Thanks", "Thank you", "Bye", or simple conversational phrases:
    - IGNORE all previous chart data instructions.
    - REPLY ONLY with a polite conversational answer.
    - DO NOT create a chart or explain data again.
3.  **DATA ACCESS:** If the user asks for "count", "rows", or "columns", US THE STATISTICS ABOVE.
4.  **SHOW DATA:** If the user asks to "see", "show", or "view" the data/table (and not a chart), set "action" to "show_data".
5.  **JSON OUTPUT:** You must output a JSON object with at least 'action' and 'text' fields.
    - 'text': The formatted markdown response explanation.
    - 'action': One of ["answer", "create_chart", "show_data"].

### 📊 CHART CREATION INSTRUCTIONS
If the user asks to create a chart or visual, you MUST set "action" to "create_chart" and INCLUDE these fields in the JSON:
- "viz_type": One of ["line", "bar", "pie", "big_number_total"].
  - Use "line" for time series or continuous X-axis.
  - Use "bar" for categorical comparisons.
  - Use "pie" for simple part-to-whole.
- "metric": The numerical column to aggregate e.g. "Sales".
- "agg_func": One of "SUM", "AVG", "COUNT", "MIN", "MAX".
- "group_by": The categorical/time column for X-axis.
- "title": A descriptive title.

### 👣 EXAMPLE 1 (Greeting)
{{
    "action": "answer",
    "text": "### 👋 Hello!\\n\\nI'm your **Data Analyst**. I'm ready to help you explore **{table_name}**.\\n\\n**What would you like to do?**\\n- 🔍 **Analyze** specific columns\\n- 📊 **Generate** a dashboard\\n- 📋 **View** the raw data"
}}

### 👣 EXAMPLE 2 (Stats)
{{
    "action": "answer",
    "text": "### 📊 Dataset Overview\\n\\nThe dataset **{table_name}** contains **2,500 rows** and **8 columns**.\\n\\n#### 🔑 Key Columns:\\n- **date** (Datetime): Transaction dates\\n- **revenue** (Float): Sales amounts\\n\\n> 💡 **Insight:** This appears to be a time-series dataset suitable for trend analysis."
}}

### 👣 EXAMPLE 3 (Create Chart)
User: "Show me sales by region"
{{
    "action": "create_chart",
    "viz_type": "bar",
    "metric": "sales",
    "agg_func": "SUM",
    "group_by": "region",
    "title": "Total Sales by Region",
    "text": "### 📊 Sales by Region\\n\\nI've created a bar chart showing the total sales for each region. This will help identify top-performing areas."
}}

**Output VALID JSON only.**
    """
    
    # Rebuild messages for proper chat structure
    messages = [{"role": "system", "content": system_instruction}]
    if messages_history:
        for msg in messages_history[-5:]:
             messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": f"{prompt}\n\nREMINDER: Reply with JSON only. If chatting, set 'action' to 'answer'."})

    for attempt in range(retries):
        try:
            # Use chat_completion for conversational models
            if attempt > 0:
                 # On retry, remind it to be strict
                 messages.append({"role": "user", "content": "Previous response was not valid JSON. Please output VALID JSON only. Escape quotes and newlines."})
            
            response = client.chat_completion(messages=messages, max_tokens=1000) # Increased tokens for dataset dumps
            if hasattr(response, "choices"):
                text = response.choices[0].message.content.strip()
            else:
                text = response.get("generated_text", "").strip()

            # DEBUG: Print raw text to console (optional, but good for logs)
            print(f"DEBUG LLM Output: {text[:200]}...")
            with open("debug_llm.log", "a", encoding="utf-8") as f:
                f.write(f"\n\n--- PROMPT: {prompt} ---\n")
                f.write(f"--- RAW RESPONSE ---\n{text}\n--------------------\n")

            # Strategy 1: Look for markdown code block
            json_block = re.search(r'```json\s*(\{.*?\})\s*```', text, re.DOTALL)
            if json_block:
                clean_text = json_block.group(1)
            else:
                # Strategy 2: Look for first { to last }
                match = re.search(r'\{.*\}', text, re.DOTALL)
                if match:
                    clean_text = match.group(0)
                else:
                     clean_text = text

            try:
                # Attempt to parse
                return json.loads(clean_text)
            except json.JSONDecodeError:
                # Strategy 3: Heuristic Fix - sometimes keys aren't quoted or newlines break it.
                # If it looks like it wanted to be an answer, just return the text.
                # Check if it looks like a chart definition (has "viz_type")
                if "viz_type" in text or '"action": "create_chart"' in text:
                     # Try to manually extract chart params
                     # Try to manually extract chart params
                     try:
                         if DEBUG:
                             print(f"DEBUG: Attempting manual extraction on text: {text[:100]}...")
                         chart_fallback = {"action": "create_chart"}
                         # Extract viz_type (flexible quotes)
                         viz_match = re.search(r'["\']viz_type["\']\s*:\s*["\'](.*?)["\']', text)
                         if viz_match:
                             chart_fallback["viz_type"] = viz_match.group(1)
                         else:
                             # If we can't find viz_type but detected it earlier, default to bar
                             chart_fallback["viz_type"] = "dist_bar"
                         
                         # Extract title
                         title_match = re.search(r'["\']title["\']\s*:\s*["\'](.*?)["\']', text)
                         chart_fallback["title"] = title_match.group(1) if title_match else "AI Generated Chart"
                         
                         # Extract metric
                         metric_match = re.search(r'["\']metric["\']\s*:\s*["\'](.*?)["\']', text)
                         chart_fallback["metric"] = metric_match.group(1) if metric_match else "count"
                         
                         # Extract agg_func
                         agg_match = re.search(r'["\']agg_func["\']\s*:\s*["\'](.*?)["\']', text)
                         chart_fallback["agg_func"] = agg_match.group(1) if agg_match else "SUM"
                         
                         # Extract group_by
                         grp_match = re.search(r'["\']group_by["\']\s*:\s*["\'](.*?)["\']', text)
                         chart_fallback["group_by"] = grp_match.group(1) if grp_match else None

                         # Check if we also have an answer explanation text
                         text_match = re.search(r'["\']text["\']\s*:\s*["\'](.*?)["\']', text, re.DOTALL)
                         if text_match:
                              chart_fallback["text"] = text_match.group(1).replace(r'\"', '"').replace(r'\\n', '\n')
                              
                              # CRITICAL FIX: Extract params from the text description if missing
                              desc_text = chart_fallback["text"]
                              
                              # 1. Viz Type from Text
                              if "viz_type" not in chart_fallback or chart_fallback["viz_type"] == "dist_bar":
                                  if "line chart" in desc_text.lower(): chart_fallback["viz_type"] = "line"
                                  elif "bar chart" in desc_text.lower(): chart_fallback["viz_type"] = "dist_bar"
                                  elif "pie chart" in desc_text.lower(): chart_fallback["viz_type"] = "pie"
                                  elif "number" in desc_text.lower(): chart_fallback["viz_type"] = "big_number_total"

                              # 2. Group By from Text
                              if "group_by" not in chart_fallback or not chart_fallback["group_by"]:
                                  grp_text_match = re.search(r'\*\*Grouping:\*\*\s*(.+)', desc_text)
                                  if grp_text_match:
                                      chart_fallback["group_by"] = grp_text_match.group(1).strip()
                                  else:
                                      # Fallback: look for "groupby X"
                                      gb_match = re.search(r'group by (\w+)', desc_text.lower())
                                      if gb_match: chart_fallback["group_by"] = gb_match.group(1)

                              # 3. Metric/Y-axis from Text
                              if "metric" not in chart_fallback or chart_fallback["metric"] == "count":
                                   # Look for "**Y-axis:** ..." or "**Aggregation:** ..." or "Y-axis:"
                                   y_match = re.search(r'(?:\*\*|)?(?:Y-axis|Aggregation|Metric)(?:\*\*|)?\s*:\s*(.+)', desc_text, re.IGNORECASE)
                                   if y_match:
                                        # e.g. "Mean Annual Income" -> try to match column
                                        raw_val = y_match.group(1).strip()
                                        chart_fallback["metric"] = raw_val

                              # 4. GroupBy/X-axis from Text (if not found above)
                              if "group_by" not in chart_fallback or not chart_fallback["group_by"]:
                                   x_match = re.search(r'(?:\*\*|)?(?:X-axis|Grouping)(?:\*\*|)?\s*:\s*(.+)', desc_text, re.IGNORECASE)
                                   if x_match:
                                       chart_fallback["group_by"] = x_match.group(1).strip()

                         return chart_fallback
                     except Exception:
                         pass # Failed manual extraction too
                
                # Check if we can extract "text" manually if it looks like JSON

                text_match = re.search(r'"text"\s*:\s*"(.*?)"', clean_text, re.DOTALL)
                if text_match:
                     # We found a text field, let's use it.
                     extracted_text = text_match.group(1).replace(r'\"', '"').replace(r'\\n', '\n')
                     return {"action": "answer", "text": extracted_text}

                # Otherwise, assume it's just a conversational response that failed JSON format
                # We interpret the WHOLE raw text as the answer.

                
                # Heuristic: Check if user wanted to show data and model replied with text "Here is the data" but failed formatting
                text_lower = text.lower()
                if "show_data" in text_lower or ("here" in text_lower and "data" in text_lower and "dataset" not in text_lower): 
                     # Loose match: "Here is the data" or "show_data" in text
                     return {"action": "show_data", "text": text}

                return {"action": "answer", "text": text}
            
        except Exception as e:
            # Check for network/DNS errors
            error_str = str(e)
            if "getaddrinfo failed" in error_str or "ConnectionError" in error_str:
                st.warning(f"Network error: Unable to connect to AI (Attempt {attempt+1}). Checking connection...")
                if attempt == retries - 1:
                     return {"action": "answer", "text": "I seem to be offline or cannot reach the AI server. Please check your internet connection."}
            else:
                st.warning(f"Llama chat attempt {attempt+1} issue: {e}")
            
            if attempt == retries - 1:
                # Final fallback
                if 'text' in locals() and text:
                     return {"action": "answer", "text": text}
                return {"action": "answer", "text": f"Error: {e}"}
            time.sleep(2 ** attempt)
    return {"action": "answer", "text": "I'm having trouble connecting to the AI. Please try again later."}

if not st.session_state.get("current_dataset_id"):
    st.info("👋 Welcome! Please upload a dataset in the sidebar to start chatting.")
elif prompt := st.chat_input("Ask me to create a chart or explain the data..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    ds_id = st.session_state.get("current_dataset_id")
    tbl_name = st.session_state.get("current_table")
    if not ds_id:
        response_text = "Please upload a dataset first so I can help you visualize it!"
        st.session_state.messages.append({"role": "assistant", "content": response_text})
        with st.chat_message("assistant"):
            st.markdown(response_text)
    else:
        df_context = st.session_state.get("current_dataframe")
        # Keyword Override for Show Data (Bypasses LLM for reliability)
        lower_prompt = prompt.lower().strip()
        
        # 1. Greeting Check (Safety Valve)
        greetings = ["hi", "hello", "hey", "thanks", "thank you", "bye", "goodbye", "help", "cool", "wow", "ok", "okay"]
        # Check if prompt is essentially just a greeting (ignoring punctuation)
        clean_prompt = re.sub(r'[^\w\s]', '', lower_prompt)
        if clean_prompt in greetings or (len(clean_prompt.split()) < 3 and any(g in clean_prompt for g in greetings)):
             # Short greeting detected
             with st.spinner("Thinking..."):
                 # Use a lightweight call or just context-free call
                 # We pass EMPTY history to prevent it from seeing the previous chart request and repeating it.
                 result = handle_chat_prompt(prompt, ds_id, tbl_name, df=None, messages_history=[])
        
        # 2. Show Data Check
        elif "show" in lower_prompt and ("data" in lower_prompt or "table" in lower_prompt or "dataset" in lower_prompt) and "chart" not in lower_prompt:
             # Check if we have data to show
             if st.session_state.get("current_dataframe") is not None:
                 result = {"action": "show_data", "text": "Sure, here is the dataset:"}
             else:
                # If no df in memory, try to fall back or just let LLM handle/explain
                 with st.spinner("Thinking..."):
                    df_context = st.session_state.get("current_dataframe")
                    history = st.session_state.messages[:-1] 
                    result = handle_chat_prompt(prompt, ds_id, tbl_name, df=df_context, messages_history=history)
        
        # 3. Standard Query
        else:
            with st.spinner("Thinking..."):
                df_context = st.session_state.get("current_dataframe")
                history = st.session_state.messages[:-1] 
                result = handle_chat_prompt(prompt, ds_id, tbl_name, df=df_context, messages_history=history)
        
        if DEBUG:
            print(f"DEBUG: result object from chat: {result}") # Tracing why text is empty
        
        if result.get("action") == "show_data":
             ans = result.get("text", "Here is the data.")
             st.session_state.messages.append({"role": "assistant", "content": ans, "show_data": True})
             with st.chat_message("assistant"):
                 st.write_stream(stream_data(ans))
                 if df_context is not None:
                     st.dataframe(df_context)
        elif result.get("action") == "create_chart":
            chart_conf = result
            params = {"adhoc_filters": [], "row_limit": 100, "datasource": f"{ds_id}__table"}
            
            # Safe defaults
            c_metric = chart_conf.get("metric", "count")
            c_agg = chart_conf.get("agg_func", "SUM")
            raw_viz = chart_conf.get("viz_type", "dist_bar").lower()
            c_title = chart_conf.get("title", f"{raw_viz} of {c_metric}")
            
            # Map simple names to Superset viz types
            viz_map = {
                "line": "echarts_timeseries_line",
                "line chart": "echarts_timeseries_line",
                "bar": "echarts_timeseries_bar",
                "dist_bar": "echarts_timeseries_bar",
                "pie": "pie",
                "pie chart": "pie",
                "number": "big_number_total",
                "big number": "big_number_total"
            }
            c_viz = viz_map.get(raw_viz, raw_viz) # Default to raw if not in map
            df_context = st.session_state.get("current_dataframe")

            # Intelligent Column Matching
            valid_cols = sup.get_columns(ds_id)
            if valid_cols:
                # Helper for fuzzy match
                def smart_match(col, options):
                    if not col or col.lower() == "count": return col
                    # Exact
                    if col in options: return col
                    # Case-insensitive
                    lower_opts = {o.lower(): o for o in options}
                    if col.lower() in lower_opts: return lower_opts[col.lower()]
                    # Fuzzy
                    close = difflib.get_close_matches(col, options, n=1, cutoff=0.6)
                    return close[0] if close else None
                
                # Fix metric
                matched_metric = smart_match(c_metric, valid_cols)
                if matched_metric:
                    c_metric = matched_metric
                elif c_metric.lower() != "count":
                     # Fallback if metric not found
                     pass # Don't overwrite if not found, let Superset fail or use raw? Actually safety:
                     # c_metric = "count" 

                # Fix group_by
                if chart_conf.get("group_by"):
                    matched_group = smart_match(chart_conf.get("group_by"), valid_cols)
                    if matched_group:
                        chart_conf["group_by"] = matched_group
                    else:
                        chart_conf["group_by"] = None

                # -----------------------------------------------------------
                # CRITICAL FIX: Check if we are using a TimeViz on non-Time col
                # -----------------------------------------------------------
                if c_viz in ["echarts_timeseries_line", "echarts_timeseries_bar", "echarts_timeseries_scatter"]:
                     target_col = chart_conf.get("group_by")
                     print(f"DEBUG: Checking chart type for {c_viz} on col {target_col}")
                     print(f"DEBUG: df_context exists? {df_context is not None}")
                     if target_col and df_context is not None and target_col in df_context.columns:
                         # Check dtype
                         col_dtype = df_context[target_col].dtype
                         is_time = False
                         if pd.api.types.is_datetime64_any_dtype(col_dtype):
                             is_time = True
                         else:
                             # Check if object/string but looks like date? 
                             # For simplicity, if it's not strictly datetime64, assume it's categorical 
                             # unless user explicitly said "Date".
                             # Actually pandas read_csv might not parse dates automatically without help.
                             # But `read_excel` might.
                             pass

                         if not is_time:
                             # If "Age" (int) or "Category" (str) -> Allow Line if requested, but use correct key.
                             # Superset's echarts_timeseries_line usually works for categories too if configured right.
                             pass
                # -----------------------------------------------------------
            

            if c_metric.lower() == "count":
                metric_spec = "count"
            else:
                metric_spec = {"expressionType": "SIMPLE", "column": {"column_name": c_metric}, "aggregate": c_agg, "label": f"{c_agg} of {c_metric}"}
            viz = c_viz
            if viz == "big_number_total":
                params["metric"] = metric_spec
                params["subheader"] = ""
            elif viz == "pie":
                params["metric"] = metric_spec
                if chart_conf.get("group_by"):
                    params["groupby"] = [chart_conf["group_by"]]
            elif viz in ["echarts_timeseries_bar", "echarts_timeseries_line"]:
                params["metrics"] = [metric_spec]
                if chart_conf.get("group_by"):
                    params["groupby"] = []
                    params["x_axis"] = chart_conf["group_by"]
            elif viz == "pivot_table_v2":
                params["metrics"] = [metric_spec]
                if chart_conf.get("group_by"):
                    params["groupbyRows"] = [chart_conf["group_by"]]
                    params["groupbyColumns"] = []
            else:
                params["metrics"] = [metric_spec]
                if chart_conf.get("group_by"):
                    params["groupby"] = [chart_conf["group_by"]]

# --- Chat Logic ---
# ... (existing history loop remains, using st.markdown for static history) ...
# ... (in handle_chat_prompt logic) ...

            try:
                c_resp = sup.create_chart(ds_id, c_title, viz, params)
                new_chart_id = c_resp.get("id")
                dash_id = st.session_state.get("current_dashboard_id")
                if dash_id:
                    sup.add_charts_to_dashboard(dash_id, [new_chart_id])
                    dash_url = sup.dashboard_url(dash_id)
                    msg = f"I've added the chart **{c_title}** to your dashboard!"
                else:
                    dash_name = f"Dashboard - {table_name}"
                    
                    # Check if dashboard already exists to prevent duplicates
                    existing_dash_id = None
                    try:
                        d_resp = sup.list_dashboards()
                        if d_resp and "result" in d_resp:
                            for d in d_resp["result"]:
                                if d.get("dashboard_title") == dash_name:
                                    existing_dash_id = d.get("id")
                                    break
                    except Exception as e:
                        print(f"DEBUG: Failed to check existing dashboards: {e}")

                    if existing_dash_id:
                         dash_id = existing_dash_id
                         msg = f"I've added **{c_title}** to the existing dashboard!"
                    else:
                         dash = sup.create_dashboard(dash_name)
                         dash_id = dash.get("id")
                         msg = f"I've created a new dashboard with **{c_title}**!"
                    
                    st.session_state["current_dashboard_id"] = dash_id
                    sup.add_charts_to_dashboard(dash_id, [new_chart_id])
                
                st.session_state.messages.append({"role": "assistant", "content": msg, "chart_url": dash_url})
                with st.chat_message("assistant"):
                    st.write_stream(stream_data(msg))
                    render_fullscreen_iframe(dash_url, height=400)
            except Exception as e:
                err_msg = f"I tried to create the chart but failed: {e}"
                st.session_state.messages.append({"role": "assistant", "content": err_msg})
                with st.chat_message("assistant"):
                    st.error(err_msg)
        else:
             # Default fallback for 'answer', 'acknowledge', or unknown actions
             # Normalize text extraction: check 'text', 'message', 'response', 'content'
            ans_text = result.get("text") or result.get("message") or result.get("response") or result.get("content")
            
            # Special case: AI put answer in 'data' field (e.g. {'action': 'answer', 'data': {...}})
            if not ans_text and result.get("data"):
                import json
                # If it's a dict/list, format nicely as JSON string, otherwise just str()
                data_val = result.get("data")
                if isinstance(data_val, (dict, list)):
                    ans_text = f"Did you mean this?\n```json\n{json.dumps(data_val, indent=2)}\n```"
                else:
                    ans_text = str(data_val)
            
            if DEBUG:
                print(f"DEBUG: Result Keys: {list(result.keys())}")
            if DEBUG:
                print(f"DEBUG: Extracted ans_text: '{ans_text}'")
            
            if not ans_text:
                ans_text = "I'm not sure how to respond to that (empty response)."
                
            st.session_state.messages.append({"role": "assistant", "content": ans_text})
            with st.chat_message("assistant"):
                st.write_stream(stream_data(ans_text))
