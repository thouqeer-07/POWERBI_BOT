import streamlit as st
import os
import re
import json
import time
import difflib
from huggingface_hub import InferenceClient

# Initialize HuggingFace Client
HF_TOKEN = st.secrets.get("HUGGINGFACE_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")
LLAMA_MODEL_ID = st.secrets.get("LLAMA_MODEL_ID") or os.getenv("LLAMA_MODEL_ID", "meta-llama/Meta-Llama-3-8B-Instruct")
client = InferenceClient(model=LLAMA_MODEL_ID, token=HF_TOKEN)

DEBUG = False # Can be synced or passed in

@st.cache_data(ttl=3600, show_spinner=False)
def get_llama_suggestions(df_serialized, table_name, retries=3):
    """Ask Llama 3 for a list of charts based on the dataframe columns using HuggingFace Inference API."""
    import pandas as pd
    import json
    
    # De-serialize dataframe if needed (though Streamlit handles it)
    if isinstance(df_serialized, str):
        df = pd.read_json(df_serialized)
    else:
        df = df_serialized

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
    # Helper for validation
    valid_cols = set(df.columns)
    numeric_cols = set(df.select_dtypes(include=['number']).columns)
    datetime_cols = set(df.select_dtypes(include=['datetime', 'datetimetz']).columns)
    
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
            
            try:
                plans = json.loads(text)
            except json.JSONDecodeError:
                if attempt == retries - 1: raise
                continue

            validated_plans = []
            
            for p in plans:
                # 1. Sanitize Basic Fields
                p["title"] = p.get("title", "Untitled Chart").strip()
                p["viz_type"] = p.get("viz_type", "dist_bar").strip().lower()
                
                # 2. Validate Aggregation Function
                p["agg_func"] = p.get("agg_func", "COUNT").upper()
                if p["agg_func"] not in ["SUM", "AVG", "COUNT", "MAX", "MIN"]:
                    p["agg_func"] = "COUNT"
                
                # 3. Validate Metric
                raw_metric = p.get("metric")
                if raw_metric:
                    # Fuzzy match metric column
                    matches = difflib.get_close_matches(raw_metric, list(valid_cols), n=1, cutoff=0.7)
                    if matches:
                         p["metric"] = matches[0]
                    elif raw_metric.lower() == "count":
                         p["metric"] = "count"
                    else:
                         p["metric"] = "count" # Fallback if unknown
                else:
                    p["metric"] = "count"
                
                if p["metric"] != "count" and p["metric"] not in numeric_cols and p["agg_func"] in ["SUM", "AVG"]:
                     p["agg_func"] = "COUNT"

                # 4. Validate Group By
                raw_group = p.get("group_by")
                if str(raw_group).lower() in ["null", "none", ""]:
                    p["group_by"] = None
                elif raw_group:
                     matches = difflib.get_close_matches(raw_group, list(valid_cols), n=1, cutoff=0.7)
                     if matches:
                         p["group_by"] = matches[0]
                     else:
                         p["group_by"] = None
                
                # 5. Logical Consistency Checks (The "Perfect" Logic)
                if p["viz_type"] == "line":
                    is_time = False
                    if p["group_by"]:
                        if p["group_by"] in datetime_cols:
                            is_time = True
                        elif "date" in p["group_by"].lower() or "year" in p["group_by"].lower() or "month" in p["group_by"].lower():
                             is_time = True
                    
                    if not is_time:
                         p["viz_type"] = "dist_bar"
                
                if p["viz_type"] == "pie" and not p["group_by"]:
                     obj_cols = df.select_dtypes(include=['object', 'category']).columns
                     if len(obj_cols) > 0:
                         p["group_by"] = obj_cols[0]
                     else:
                         p["viz_type"] = "big_number_total"
                
                if p["viz_type"] == "big_number_total":
                    p["group_by"] = None

                validated_plans.append(p)

            return validated_plans
        except Exception as e:
            if attempt == retries - 1:
                st.error(f"Llama suggestion failed (Final Attempt): {e}")
                return []
            time.sleep(2 ** attempt)
    return []

@st.cache_data(ttl=1800, show_spinner=False)
def handle_chat_prompt(prompt, dataset_id, table_name, df_serialized=None, messages_history_tuple=None, retries=3):
    """Interpret user chat prompt using Llama 3 via HuggingFace to either answer questions or create charts."""
    import pandas as pd
    
    # Convert tuple back to list for internal use
    messages_history = list(messages_history_tuple) if messages_history_tuple else []
    
    # De-serialize dataframe
    if df_serialized is not None:
         if isinstance(df_serialized, str):
             df = pd.read_json(df_serialized)
         else:
             df = df_serialized
    else:
        df = None

    if not HF_TOKEN:
        return {"action": "answer", "text": "HuggingFace token not set. Unable to process request."}
    
    # Generate dataset context
    context_str = ""
    if df is not None:
        try:
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
        except Exception as e:
            context_str = f"Error generating context: {e}"

    system_instruction = f'''
You are an Expert Data Analyst and Visualization Architect.
Your name is 'Superset Assistant', created by Syed Thouqeer Ahmed A.
The user is asking about the dataset "{table_name}".

{context_str}

### YOUR GOAL
Provide insightful, professional, and structured responses. Act like a senior analyst presenting findings.

### RESPONSE GUIDELINES
1. FORMATTING IS CRITICAL:
    - Use H3 Headers (###) to organize sections.
    - Use Bullet Points for lists.
    - Use Bold for key metrics and column names.
    - Use Blockquotes (>) for summaries or key takeaways.
    - Use Emojis effectively.
2. CONTENT STYLE:
    - Be Insightful: Do not just list numbers; explain what they might mean.
    - Be Direct: Answer specific questions immediately.
    - Be Proactive: Suggest relevant visualizations.

### CRITICAL INSTRUCTIONS
1. PRIORITIZE THE LATEST USER MESSAGE: The user latest message at the bottom is your current task.
2. STOP AND RESET ON GREETINGS: If the user says Hi, Hello, Thanks, etc., reply politely and ignore previous data instructions.
3. DATA ACCESS: Use the STATISTICS ABOVE.
4. SHOW DATA: If the user asks to see or view the data table, set action to "show_data".
5. JSON OUTPUT: Output a JSON object with at least "action" and "text" fields.

### CHART CREATION INSTRUCTIONS
If the user asks to create a chart, set "action" to "create_chart" and include:
- "viz_type": One of ["line", "bar", "pie", "big_number_total"].
- "metric": The numerical column.
- "agg_func": One of "SUM", "AVG", "COUNT", "MIN", "MAX".
- "group_by": The categorical/time column.
- "title": A descriptive title.

### EXAMPLE 1 (Greeting)
{{
    "action": "answer",
    "text": "### 👋 Hello!\\n\\nI am your Data Analyst. I am ready to help you explore **{{table_name}}**."
}}

### EXAMPLE 2 (Stats)
{{
    "action": "answer",
    "text": "### 📊 Dataset Overview\\n\\nThe dataset **{{table_name}}** contains results."
}}

**Output VALID JSON only.**
    '''
    
    messages = [{"role": "system", "content": system_instruction}]
    if messages_history:
        for msg in messages_history[-5:]:
             messages.append({"role": msg["role"], "content": msg["content"]})
    messages.append({"role": "user", "content": f"{prompt}\n\nREMINDER: Reply with JSON only. If chatting, set 'action' to 'answer'."})

    for attempt in range(retries):
        try:
            if attempt > 0:
                 messages.append({"role": "user", "content": "Previous response was not valid JSON. Please output VALID JSON only."})
            
            response = client.chat_completion(messages=messages, max_tokens=1000)
            if hasattr(response, "choices"):
                text = response.choices[0].message.content.strip()
            else:
                text = response.get("generated_text", "").strip()

            # Extract JSON from response
            json_block = re.search(r'```json\s*(\{.*?\})\s*```', text, re.DOTALL)
            if json_block:
                clean_text = json_block.group(1)
            else:
                match = re.search(r'\{.*\}', text, re.DOTALL)
                clean_text = match.group(0) if match else text

            try:
                return json.loads(clean_text)
            except json.JSONDecodeError:
                if "viz_type" in text or '"action": "create_chart"' in text:
                    # Manual extraction fallback (Same as original code)
                    chart_fallback = {"action": "create_chart"}
                    viz_match = re.search(r'["\']viz_type["\']\s*:\s*["\'](.*?)["\']', text)
                    chart_fallback["viz_type"] = viz_match.group(1) if viz_match else "dist_bar"
                    title_match = re.search(r'["\']title["\']\s*:\s*["\'](.*?)["\']', text)
                    chart_fallback["title"] = title_match.group(1) if title_match else "AI Generated Chart"
                    metric_match = re.search(r'["\']metric["\']\s*:\s*["\'](.*?)["\']', text)
                    chart_fallback["metric"] = metric_match.group(1) if metric_match else "count"
                    agg_match = re.search(r'["\']agg_func["\']\s*:\s*["\'](.*?)["\']', text)
                    chart_fallback["agg_func"] = agg_match.group(1) if agg_match else "SUM"
                    grp_match = re.search(r'["\']group_by["\']\s*:\s*["\'](.*?)["\']', text)
                    chart_fallback["group_by"] = grp_match.group(1) if grp_match else None
                    return chart_fallback
                return {"action": "answer", "text": text}
        except Exception as e:
            if attempt == retries - 1:
                return {"action": "answer", "text": f"Error: {e}"}
            time.sleep(1)
    return {"action": "answer", "text": "Failed to get response."}
