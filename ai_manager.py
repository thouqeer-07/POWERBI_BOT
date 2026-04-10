import os
import sys
import re
import json
import time
import difflib
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

# HF CLIENT
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
# LLAMA 3 - POWERFUL & BALANCED
LLAMA_MODEL_ID = "meta-llama/Meta-Llama-3-8B-Instruct"

client = None
if HF_TOKEN:
    client = InferenceClient(token=HF_TOKEN)

DEBUG = False

def get_llama_suggestions(df_serialized, table_name, retries=3):
    """Ask Llama 3 via Hugging Face for a list of charts based on the dataframe columns."""
    import pandas as pd
    
    if isinstance(df_serialized, str):
        df = pd.read_json(df_serialized)
    else:
        df = df_serialized

    if not client:
        print("WARNING: HUGGINGFACE_TOKEN not set. AI suggestions disabled.")
        return []
        
    # COL INFO
    col_info = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        sample = str(df[col].head(3).tolist())
        col_info.append(f"- {col} ({dtype}): e.g., {sample}")
    col_text = "\n".join(col_info)

    system_instruction = f"""
You are an expert Data Analyst and Visualization Architect.
I have a dataset '{table_name}' with the following columns:
{col_text}

Your goal is to suggest 4-6 diverse, meaningful, and accurate visualizations to summarize this data.
- Analyze the column names and data types to understand the semantic meaning (e.g., time, category, money).
- Suggest charts that reveal key insights, trends, or distributions.
- IMPORTANT: Ensure variety. Do not suggest 4 bar charts. Use a mix of bar, line (if time-series), pie, and big_number_total.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON array of objects.
2. "viz_type" MUST be strictly one of: ["dist_bar", "pie", "line", "big_number_total"].
   - Use "dist_bar" for categorical comparisons (e.g., by City, Gender, Status).
   - Use "line" ONLY if there is a real Date/Time column.
   - Use "pie" for partitions with few unique categories.
   - Use "big_number_total" for simple counts or totals.
3. "agg_func" MUST be one of: ["SUM", "AVG", "COUNT", "MAX", "MIN"].
4. Ensure "metric" is a numeric column (or "count").
5. "group_by" should be a categorical or date column. For "big_number_total", set "group_by" to null.
6. MANDATORY: Use the exact column names provided in the context below. Do not assume or change them.
7. valid JSON only. No conversation, no explanations.

Example JSON output structure:
[
  {{
    "title": "Total Revenue by Region",
    "viz_type": "dist_bar",
    "metric": "sales_amount",
    "group_by": "region",
    "agg_func": "SUM"
  }}
]
"""
    valid_cols = set(df.columns)
    numeric_cols = set(df.select_dtypes(include=['number']).columns)
    datetime_cols = set(df.select_dtypes(include=['datetime', 'datetimetz']).columns)
    
    for attempt in range(retries):
        try:
            messages = [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": "Provide the visualization suggestions JSON array now."}
            ]
            
            response = client.chat_completion(
                model=LLAMA_MODEL_ID,
                messages=messages,
                max_tokens=1000,
                temperature=0.2
            )
            
            text = response.choices[0].message.content.strip()
            
            # GET JSON ARRAY
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
                p["title"] = p.get("title", "Untitled Chart").strip()
                p["viz_type"] = p.get("viz_type", "dist_bar").strip().lower()
                p["agg_func"] = p.get("agg_func", "COUNT").upper()
                if p["agg_func"] not in ["SUM", "AVG", "COUNT", "MAX", "MIN"]:
                    p["agg_func"] = "COUNT"
                
                raw_metric = str(p.get("metric", "")).strip()
                if raw_metric:
                    # Case-insensitive robust matching
                    matches = difflib.get_close_matches(raw_metric.lower(), [c.lower() for c in valid_cols], n=1, cutoff=0.7)
                    if matches:
                        # Map back to EXACT original casing in valid_cols
                        idx = [c.lower() for c in valid_cols].index(matches[0])
                        p["metric"] = list(valid_cols)[idx]
                    elif raw_metric.lower() == "count": p["metric"] = "count"
                    else: p["metric"] = "count"
                else: p["metric"] = "count"
                
                if p["metric"] != "count" and p["metric"] not in numeric_cols and p["agg_func"] in ["SUM", "AVG"]:
                     p["agg_func"] = "COUNT"

                raw_group = str(p.get("group_by", "")).strip()
                if raw_group.lower() in ["null", "none", "", "nan"]:
                    p["group_by"] = None
                elif raw_group:
                     # Case-insensitive robust matching
                     matches = difflib.get_close_matches(raw_group.lower(), [c.lower() for c in valid_cols], n=1, cutoff=0.7)
                     if matches:
                         # Map back to EXACT original casing in valid_cols
                         idx = [c.lower() for c in valid_cols].index(matches[0])
                         p["group_by"] = list(valid_cols)[idx]
                     else: p["group_by"] = None
                
                if p["viz_type"] == "line":
                    is_time = False
                    if p["group_by"]:
                        if p["group_by"] in datetime_cols or any(k in p["group_by"].lower() for k in ["date", "time", "year", "month"]):
                             is_time = True
                    if not is_time: p["viz_type"] = "dist_bar"
                
                if p["viz_type"] == "pie" and not p["group_by"]:
                     obj_cols = df.select_dtypes(include=['object', 'category']).columns
                     if len(obj_cols) > 0: p["group_by"] = obj_cols[0]
                     else: p["viz_type"] = "big_number_total"
                
                if p["viz_type"] == "big_number_total":
                    p["group_by"] = None

                validated_plans.append(p)

            return validated_plans
        except Exception as e:
            if attempt == retries - 1:
                print(f"ERROR: Llama suggestion failed: {e}")
                return []
            time.sleep(2)
    return []

def get_quick_insights(df_serialized, table_name, retries=3):
    """Generate the top 3 trends and top 2 anomalies for a dataset."""
    import pandas as pd
    
    if isinstance(df_serialized, str):
        df = pd.read_json(df_serialized)
    else:
        df = df_serialized

    if not client:
        return {"trends": [], "anomalies": []}

    # AI CONTEXT
    col_info = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        sample = str(df[col].head(5).tolist())
        col_info.append(f"- {col} ({dtype}): e.g., {sample}")
    col_text = "\n".join(col_info)
    
    stats = ""
    try:
        stats = df.describe(include='all').to_string()
    except: pass

    system_instruction = f"""
You are a Senior Data Scientist and Lead Business Intelligence Analyst.
Analyze the dataset '{table_name}' with the following schema and statistics:

COLUMNS:
{col_text}

SUMMARY STATISTICS:
{stats[:2000]} # Limit to avoid token overflow

Your goal is to identify exactly:
1. The **Top 3 Trends** in this data (growth, distributions, correlations).
2. The **Top 2 Anomalies** or outliers (missing values, unusual values, unexpected zeros).

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object.
2. Structure: {{"trends": ["Trend 1", "Trend 2", "Trend 3"], "anomalies": ["Anomaly 1", "Anomaly 2"]}}
3. Be specific, professional, and data-driven.
4. If the data is too limited, provide generic but plausible observations based on the column names.
5. NO conversation, NO markdown, JUST JSON.
"""

    for attempt in range(retries):
        try:
            messages = [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": "Provide the quick insights JSON object now."}
            ]
            
            response = client.chat_completion(
                model=LLAMA_MODEL_ID,
                messages=messages,
                max_tokens=800,
                temperature=0.3
            )
            
            text = response.choices[0].message.content.strip()
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                text = match.group(0)
            
            insights = json.loads(text)
            
            # KEYS CHECK
            if "trends" not in insights: insights["trends"] = []
            if "anomalies" not in insights: insights["anomalies"] = []
            
            # LIMIT RESULTS
            insights["trends"] = insights["trends"][:3]
            insights["anomalies"] = insights["anomalies"][:2]
            
            return insights
        except Exception as e:
            if attempt == retries - 1:
                print(f"ERROR: Quick Insights failed: {e}")
                return {"trends": ["Unable to generate trends"], "anomalies": ["Unable to generate anomalies"]}
            time.sleep(1)
    return {"trends": [], "anomalies": []}


def handle_chat_prompt(prompt, dataset_id, table_name, df_serialized=None, messages_history_tuple=None, retries=3):
    """Interpret user chat prompt using Llama 3 via Hugging Face."""
    import pandas as pd
    
    messages_history = list(messages_history_tuple) if messages_history_tuple else []
    
    if df_serialized is not None:
         if isinstance(df_serialized, str):
             df = pd.read_json(df_serialized)
         else:
             df = df_serialized
    else:
        df = None

    if not client:
        return {"action": "answer", "text": "HUGGINGFACE_TOKEN not set. Unable to process request."}
    
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
You are an Expert Data Analyst named 'Superset Assistant'.
Created by Syed Thouqeer Ahmed A.
The user is asking about the dataset "{table_name}".

{context_str}

### YOUR MISSION
Provide **insightful, professional, and visually stunning** responses. Your goal is to WOW the user with his highly-expressive and bold-happy formatting.

### 🎨 DESIGN & FORMATTING RULES
1. **HEADER HIERARCHY**: Always use `###` for main headers.
2. **AGGRESSIVE BOLDING**: Use **bold text** for **EVERY** important metric, **column name**, **number**, or **key insight**. If it's important, **BOLD IT**.
3. **STRICT LISTS**: Use standard Markdown `- ` for bullets.
4. **EMOJI EXPLOSION**: Use **at least one emoji** for **EVERY** bullet point and header. Be creative! (🚀, 💎, ✨, 📊, 📈, 🎯, 💡, 📅, 🔍).
5. **NEATNESS**: Ensure a blank line between headers and paragraphs.

### 🤖 LOGIC RULES
1. **ONLY** use `action: "create_chart"` if the user's **LATEST** message explicitly asks for a new visualization.
2. **MANDATORY**: Use the **EXACT** column names from the provided schema below. Do not guess or modify them.
3. For all other queries (Greetings, "Explain the data", "Show rows", etc.), use `action: "answer"`.
3. **MANDATORY TEXT**: Every response **MUST** include a helpful `text` field with at least 2-3 sentences of explanation.

### 🏆 GOLD STANDARD EXAMPLE (JSON)
```json
{{
  "action": "answer",
  "text": "### 📊 Dataset Overview: **{table_name}** 🚀\\n\\nWelcome! ✨ I've analyzed your **data** and here is what I found:\\n\\n- 💎 **Total Rows**: Current dataset contains **1,240** records.\\n- 🎯 **Key Columns**: We have data on **Revenue**, **Region**, and **Customer Segment**.\\n- 💡 **Insight**: Most of your **sales** come from the **North** region during **Q3** 📈.\\n\\nHow can I help you visualize this **stunning data** today? ✨"
}}
```

### OUTPUT FORMAT
Output ONLY valid JSON. No preamble.

{{
  "action": "create_chart" | "answer",
  "text": "Your visually stunning, bold-heavy, and emoji-rich markdown response here",
  "viz_type": "line" | "dist_bar" | "pie" | "big_number_total" (only if create_chart),
  "metric": "column_name" | "count" (only if create_chart),
  "agg_func": "SUM" | "AVG" | "COUNT" | "MIN" | "MAX" (only if create_chart),
  "group_by": "column_name" | null (only if create_chart),
  "title": "Descriptive Title" (only if create_chart)
}}
'''
    
    messages = [{"role": "system", "content": system_instruction}]
    for msg in messages_history[-8:]:
        messages.append({"role": msg["role"], "content": msg["content"]})
    
    messages.append({"role": "user", "content": f"{prompt}\n\nREMINDER: Reply with JSON only."})

    for attempt in range(retries):
        try:
            response = client.chat_completion(
                model=LLAMA_MODEL_ID,
                messages=messages,
                max_tokens=800,
                temperature=0.2
            )
            
            text = response.choices[0].message.content.strip()
            
            # Extract JSON object
            match = re.search(r'\{.*\}', text, re.DOTALL)
            if match:
                text = match.group(0)
            
            try:
                return json.loads(text)
            except json.JSONDecodeError:
                if attempt == retries - 1:
                    return {"action": "answer", "text": text}
                messages.append({"role": "assistant", "content": text})
                messages.append({"role": "user", "content": "That was not valid JSON. Please provide ONLY the JSON object."})
                continue
                
        except Exception as e:
            if attempt == retries - 1:
                return {"action": "answer", "text": f"Error interacting with Llama 3: {e}"}
            time.sleep(1)
            
    return {"action": "answer", "text": "Failed to get response."}
