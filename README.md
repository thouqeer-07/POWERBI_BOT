# 🤖 BI BOT: AI-Powered BI Assistant

BI BOT is a cutting-edge, AI-driven Business Intelligence assistant that bridges the gap between raw data and actionable insights. By combining the power of **Streamlit**, **Llama 3**, and **Apache Superset**, it automates the process of data analysis and visualization.

---

## 🚀 How It Works

1.  **Data Upload**: Users upload CSV or Excel files through the Streamlit interface.
2.  **Database Integration**: The data is automatically uploaded to a **Supabase PostgreSQL** database.
3.  **AI Insights**: **Llama 3** analyzes the dataset's structure and suggests the most relevant visualizations (metrics, distributions, trends).
4.  **Instant Dashboards**: With one click, the system communicates with **Apache Superset's API** to programmatically create datasets, charts, and a fully functional dashboard.
5.  **Interactive Chat**: Users can interact with their data using natural language to ask questions, request new charts, or get deep-dive insights.

---

## ✨ Why It Is Important

-   **Zero SQL Required**: Empowers non-technical users to generate complex BI dashboards without writing a single line of code or SQL.
-   **Reduced Time-to-Insight**: Automated visualization suggestions eliminate the "blank canvas" problem, providing immediate value from uploaded data.
-   **Seamless Workflow**: Orchestrates the entire pipeline from data ingestion to visualization in a single, intuitive interface.
-   **AI-Enhanced Analysis**: Leverages LLMs to understand the semantic context of data, rather than just treating it as raw numbers.

---

## 🛠️ Key Features

-   📊 **Smart Suggestions**: Automated generation of 4-6 relevant charts based on data types.
-   💬 **Conversational BI**: Chatbot interface to explore data and create on-demand visualizations.
-   📁 **Multi-Format Support**: Handle both CSV and Excel file uploads.
-   🖇️ **Live Superset Integration**: Programmatic dashboard creation via the Superset REST API.
-   🎨 **Full-Screen Interaction**: Seamlessly embedded Superset iframes with custom full-screen toggles.

---

## 💻 Technology Stack

-   **Frontend**: [Streamlit](https://streamlit.io/)
-   **AI Engine**: [Meta Llama 3](https://llama.meta.com/) (hosted on HuggingFace Inference API)
-   **BI Engine**: [Apache Superset](https://superset.apache.org/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/) (Supabase)
-   **Communication**: Rest APIs, SQLAlchemy, Pandas

---

## Link to the app

https://bitestbot.streamlit.app/

