import os
import sys
import re
import json
import time
import difflib
from huggingface_hub import InferenceClient
from dotenv import load_dotenv

load_dotenv()

# Initialize Hugging Face Client
HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
# We use Llama 3 8B Instruct as the default powerful balanced model
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
        
    # Prepare column info
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
6. valid JSON only. No conversation, no explanations.

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
            
            # Extract JSON array using regex in case Llama adds extra text
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
                
                raw_metric = p.get("metric")
                if raw_metric:
                    matches = difflib.get_close_matches(raw_metric, list(valid_cols), n=1, cutoff=0.7)
                    if matches: p["metric"] = matches[0]
                    elif raw_metric.lower() == "count": p["metric"] = "count"
                    else: p["metric"] = "count"
                else: p["metric"] = "count"
                
                if p["metric"] != "count" and p["metric"] not in numeric_cols and p["agg_func"] in ["SUM", "AVG"]:
                     p["agg_func"] = "COUNT"

                raw_group = p.get("group_by")
                if str(raw_group).lower() in ["null", "none", ""]:
                    p["group_by"] = None
                elif raw_group:
                     matches = difflib.get_close_matches(raw_group, list(valid_cols), n=1, cutoff=0.7)
                     if matches: p["group_by"] = matches[0]
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
2. For all other queries (Greetings, "Explain the data", "Show rows", etc.), use `action: "answer"`.
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
