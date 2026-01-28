import streamlit as st
import uuid
DEBUG = False  # Set to True to enable debug prints
import streamlit.components.v1 as components
import re
import time
import os
st.set_page_config(
        page_title="BI Chatbot",  
        layout="centered"
    )
# --- Helper for Typewriter Effect ---
def stream_data(text, delay=0.02):
    for word in text.split(" "):
        yield word + " "
        time.sleep(delay)
import json
import concurrent.futures
import difflib
import pandas as pd
from sqlalchemy import create_engine
from dotenv import load_dotenv
import requests
from ai_manager import get_llama_suggestions, handle_chat_prompt

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
def get_superset_client(version="1.0.2"): # Bump version to force cache clear
    # Internal API URL (Bot -> Superset)
    api_url = st.secrets.get("SUPERSET_URL") or os.getenv("SUPERSET_URL") or "http://localhost:8088"
    # Public URL (Browser -> Superset)
    public_url = st.secrets.get("SUPERSET_PUBLIC_URL") or os.getenv("SUPERSET_PUBLIC_URL")
    
    return SupersetClient(api_url=api_url, public_url=public_url)

try:
    sup = get_superset_client()
    # SECONDARY CHECK: If for some reason cache persists old class definition
    if not hasattr(sup, "get_or_create_embedded_config"):
        st.cache_resource.clear()
        sup = get_superset_client()
except Exception as e:
    st.error(f"Failed to initialize Superset Client: {e}")
    st.stop()

@st.cache_data(ttl=3600, show_spinner=False)
def get_cached_database_id(db_name):
    """Cache the database ID lookup to avoid repeated API calls on startup."""
    try:
        # Re-initialize client if cached data is stale or client is lost
        client = get_superset_client()
        return client.get_database_id(db_name)
    except:
        return None

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
 
def render_superset_embedded(dashboard_id, height=800):
    """Render a Superset dashboard using Direct Iframe (Fastest)."""
    try:
        # Construct Public Dashboard URL directly from public_url
        dashboard_url = f"{sup.public_url.rstrip('/')}/superset/dashboard/{dashboard_id}/?standalone=true"
        components.iframe(dashboard_url, height=height, scrolling=True)
    except Exception as e:
        # Minimal Fallback
        url = f"{sup.api_url.rstrip('/')}/superset/dashboard/{dashboard_id}/?standalone=true"
        components.iframe(url, height=height, scrolling=True)
 
def scroll_to_top():
    """Inject Javascript to scroll the page to the top robustly."""
    components.html(
        """
        <script>
            // Try to find the main scrollable container in Streamlit
            function doScroll() {
                var mainSections = window.parent.document.querySelectorAll('section.main');
                if (mainSections.length > 0) {
                    mainSections.forEach(s => s.scrollTo({top: 0, behavior: 'auto'}));
                } else {
                    window.parent.scrollTo({top: 0, behavior: 'auto'});
                }
            }
            // Execute immediately and then once more after a short delay
            doScroll();
            setTimeout(doScroll, 100);
            setTimeout(doScroll, 300);
        </script>
        """,
        height=0,
    )

import time




st.title("Superset AI Assistant")

# Sidebar for File Upload
with st.sidebar:
    st.header("Data Upload")
    
    # 1. OPTIMIZATION: Faster connectivity check
    if "superset_db_id" not in st.session_state:
        # Check if we already tried and failed to avoid loops
        if not st.session_state.get("db_connection_attempted"):
            with st.spinner("Connecting to Superset..."):
                try:
                    # Priority 1: Check if already exists (Cached)
                    db_id = get_cached_database_id("Supabase_Cloud")
                    if db_id:
                        st.session_state["superset_db_id"] = db_id
                    else:
                        # Priority 2: Try to Add it (using internal URI)
                        # We use a non-cached call here because adding is a mutation
                        sup.add_database("Supabase_Cloud", DOCKER_DB_URI)
                        db_id = sup.get_database_id("Supabase_Cloud")
                        if db_id:
                            st.session_state["superset_db_id"] = db_id
                            st.cache_data.clear() # Clear cache to reflect new DB
                except Exception as e:
                    if "already exists" in str(e).lower():
                        st.session_state["superset_db_id"] = 1
                    else:
                        st.sidebar.warning("⚡ Superset API unreachable.")
                finally:
                    st.session_state["db_connection_attempted"] = True
    
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
            # Auto-assign default if listing fails
            db_id = getattr(sup, "database_id", None) or 1
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
            st.session_state["dashboard_creation_state"] = "REVIEW" # Set initial state
            # Remove st.rerun() here - let Streamlit update the UI naturally on next script execution
            # Since we just updated session_state, the next block will see it.
        except Exception as e:
            st.warning(f"Uploaded to DB but failed to create Superset dataset: {e}")
    except Exception as e:
        st.error(f"Failed to upload file: {e}")

# Handle automatic scroll-to-top on state transitions
if st.session_state.get("dashboard_creation_state") in ["BUILDING", "VERIFY"]:
    scroll_to_top()

# Initialize chat history
if "messages" not in st.session_state:
    st.session_state.messages = []







for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])
        if message.get("dashboard_id"):
            render_superset_embedded(message["dashboard_id"], height=600)
        elif message.get("chart_url"):
            render_fullscreen_iframe(message["chart_url"], height=600)
        if message.get("show_data"):
             df_view = st.session_state.get("current_dataframe")
             if df_view is not None:
                 st.dataframe(df_view)

# --- Dashboard Generation UI (State Machine) ---
# --- Dashboard Generation UI (State Machine) ---
if "dashboard_plan" in st.session_state:
    
    # ---------------------------------------------------------
    # STATE 1: SUCCESS (Dashboard Created) -> VERIFY
    # ---------------------------------------------------------
    current_state = st.session_state.get("dashboard_creation_state", "REVIEW")
    
    if current_state == "VERIFY":
        st.header("✅ Dashboard Created!")
        dash_url = st.session_state.get("created_dashboard_url")
        dash_id = st.session_state.get("created_dashboard_id")
        render_superset_embedded(dash_id, height=800)
        
        c1, c2 = st.columns(2)
        if c1.button("Confirm & Keep"):
            msg = f"I've created a new dashboard! You can view it here: [Dashboard Link]({dash_url})"
            st.session_state.messages.append({
                "role": "assistant", 
                "content": msg, 
                "chart_url": dash_url,
                "dashboard_id": dash_id
            })
            
            # Cleanup State
            del st.session_state["dashboard_plan"]
            if "dashboard_creation_state" in st.session_state: del st.session_state["dashboard_creation_state"]
            if "pending_dashboard_plan" in st.session_state: del st.session_state["pending_dashboard_plan"]
            
            st.success("Dashboard finalized!")
            st.rerun()
    
        elif c2.button("Reject & Delete"):
            # 1. Capture necessary IDs and clear state IMMEDIATELY for responsiveness
            dash_id = st.session_state.get("created_dashboard_id")
            chart_uuids = st.session_state.get("created_chart_uuids", [])
            chart_map = st.session_state.get("chart_uuid_map", {})
            chart_ids = [chart_map.get(uid) for uid in chart_uuids if chart_map.get(uid)]
            
            # Reset dashboard related session state immediately
            for key in ["created_dashboard_id", "created_dashboard_url", "created_chart_uuids", "chart_uuid_map"]:
                if key in st.session_state:
                    del st.session_state[key]
            
            # 2. Perform deletions (Speed up with Parallelism)
            with st.spinner("Deleting dashboard and charts..."):
                # Delete Dashboard (Sequential, but usually fast)
                try:
                    if dash_id:
                        sup.delete_dashboard(dash_id)
                except Exception as e:
                    st.error(f"Failed to delete dashboard: {e}")
                
                # Delete Charts in Parallel
                if chart_ids:
                    def delete_chart_task(c_id):
                        try:
                            sup.delete_chart(c_id)
                            return True
                        except Exception as e:
                            print(f"Failed to delete chart {c_id}: {e}")
                            return False

                    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
                        results = list(executor.map(delete_chart_task, chart_ids))
                    
                    deleted_count = sum(1 for r in results if r)
                    if deleted_count > 0:
                        st.toast(f"Deleted {deleted_count} charts.")
            
            st.session_state["dashboard_creation_state"] = "REVIEW" # Go back to Review
            st.info("Dashboard rejected. You can modify the plan below.")
            st.rerun()

    # ---------------------------------------------------------
    # STATE 2: BUILDING (Processing - No Form Visible)
    # ---------------------------------------------------------
    elif current_state == "BUILDING":
            status = st.status("Building Dashboard...", expanded=True)
            try:
                # Do NOT clean up temp state instantly. Wait for success or error.
                
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
                        if "dashboard_creation_state" in st.session_state: st.session_state["dashboard_creation_state"] = "REVIEW" # Reset on critical error
                        st.stop()
                
                created_chart_ids = []
                # Optimization: Parallel Chart Creation
                # Optimization: Parallel Chart Creation
                def create_single_chart(chart):
                    # NOTE: Do NOT call st.write or status.write here to avoid Missing ScriptRunContext errors in threads.
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
                        chart_id = c_resp.get("id")
                        chart_uuid = str(uuid.uuid4())
                        return {"id": chart_id, "uuid": chart_uuid, "title": chart["title"]}
                    except Exception as e:
                        print(f"Failed to create chart '{chart['title']}': {e}")
                        return None

                created_chart_ids = []
                
                # Execute in parallel
                with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
                     # Submit all tasks
                     future_to_chart = {executor.submit(create_single_chart, chart): chart for chart in updated_plan}
                     
                     for future in concurrent.futures.as_completed(future_to_chart):
                         result = future.result()
                         if result:
                             c_id = result["id"]
                             c_uuid = result["uuid"]
                             title = result.get("title", "Chart")
                             status.write(f"Created: {title}") # Update UI from Main Thread
                             created_chart_ids.append(c_id)
                             
                             # Store mapping (using session state inside thread safety usually fine if just dict assign)
                             if "chart_uuid_map" not in st.session_state:
                                 st.session_state["chart_uuid_map"] = {}
                             st.session_state["chart_uuid_map"][c_uuid] = c_id
                             
                             if "created_chart_uuids" not in st.session_state:
                                 st.session_state["created_chart_uuids"] = []
                             st.session_state["created_chart_uuids"].append(c_uuid)

                
                if created_chart_ids:
                    status.write("Creating Dashboard container...")
                    # Append timestamp to ensure unique slug
                    import time
                    timestamp = int(time.time())
                    dash_name = f"Dashboard - {table_name} ({len(created_chart_ids)} charts) [{timestamp}]"
                    dash = sup.create_dashboard(dash_name)
                    dash_id = dash.get("id")
                    st.session_state["current_dashboard_id"] = dash_id
                    status.write("Linking charts to dashboard...")
                    sup.add_charts_to_dashboard(dash_id, created_chart_ids)
                    dash_url = sup.dashboard_url(dash_id)
                    status.update(label="Dashboard Created!", state="complete", expanded=False)
                    
                    st.session_state["created_dashboard_id"] = dash_id
                    st.session_state["created_dashboard_url"] = dash_url
                    st.session_state["created_chart_ids"] = created_chart_ids # Store for potential rollback
                    st.session_state["dashboard_creation_state"] = "VERIFY"
                    

                    
                    st.rerun() 
                else:
                    status.error("No charts were successfully created.")
                    # Allow retry
                    st.session_state["dashboard_creation_state"] = "REVIEW"
            except Exception as e:
                status.error(f"Process failed: {e}")
                # Allow retry
                st.session_state["dashboard_creation_state"] = "REVIEW"

    # ---------------------------------------------------------
    # STATE 3: INPUT FORM (Default) -> REVIEW
    # ---------------------------------------------------------
    elif current_state == "REVIEW":
        with st.expander("📊 Review Dashboard Plan", expanded=True):
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
                st.session_state["pending_dashboard_plan"] = updated_plan
                st.session_state["dashboard_creation_state"] = "BUILDING"
                st.rerun()




if not st.session_state.get("current_dataset_id"):
    st.info("👋 Welcome! Please upload a dataset in the sidebar to start chatting.")
elif prompt := st.chat_input("Ask me to create chart or explain dataset"):
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
                 # Pass a tuple for history to make it hashable for caching
                 result = handle_chat_prompt(prompt, ds_id, tbl_name, df_serialized=None, messages_history_tuple=())
        
        # 2. Show Data Check
        elif "show" in lower_prompt and ("data" in lower_prompt or "table" in lower_prompt or "dataset" in lower_prompt) and "chart" not in lower_prompt:
             # Check if we have data to show
             if st.session_state.get("current_dataframe") is not None:
                 result = {"action": "show_data", "text": "Sure, here is the dataset:"}
             else:
                 with st.spinner("Thinking..."):
                    df_context = st.session_state.get("current_dataframe")
                    history = tuple(st.session_state.messages[:-1]) # Convert to tuple for hashing
                    result = handle_chat_prompt(prompt, ds_id, tbl_name, df_serialized=df_context, messages_history_tuple=history)
        
        # 3. Standard Query
        else:
            with st.spinner("Thinking..."):
                df_context = st.session_state.get("current_dataframe")
                history = tuple(st.session_state.messages[:-1]) # Convert to tuple for hashing
                result = handle_chat_prompt(prompt, ds_id, tbl_name, df_serialized=df_context, messages_history_tuple=history)
        
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
