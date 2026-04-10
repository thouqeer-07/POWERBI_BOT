import os
import json
import uuid
import pandas as pd
from datetime import datetime, timedelta, timezone
import re
import traceback
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import create_engine, Column, Integer, String, DateTime, text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from jose import JWTError, jwt
import bcrypt # type: ignore
from dotenv import load_dotenv

load_dotenv()

from ai_manager import get_llama_suggestions, handle_chat_prompt, get_quick_insights
from superset_client import SupersetClient

app = FastAPI(title="BI BOT API")

# React needs CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # replace this later in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# SETTINGS
DB_URI = os.getenv("DB_URI", "postgresql://superset:superset_password@localhost:5432/superset")
SUPERSET_URL = os.getenv("SUPERSET_URL", "http://localhost:8088")
SUPERSET_PUBLIC_URL = os.getenv("SUPERSET_PUBLIC_URL", "http://localhost:8088")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

# DB STUFF
safe_uri = DB_URI.split('@')[-1] if '@' in DB_URI else DB_URI
print(f"Connecting to database at: {safe_uri}")
engine = create_engine(DB_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    username = Column(String, unique=True, index=True)
    phone_number = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True)
    table_name = Column(String)
    prefixed_table_name = Column(String)
    dataset_id = Column(Integer)
    analysis_plan = Column(String, nullable=True) # JSON string of the AI plan
    dashboard_id = Column(Integer, nullable=True)
    dashboard_url = Column(String, nullable=True)
    insights = Column(String, nullable=True) # JSON string of AI insights
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    role = Column(String)
    content = Column(String)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

try:
    Base.metadata.create_all(bind=engine)
    print("Database tables verified/created successfully.")
except Exception as e:
    print(f"CRITICAL: Database connection error: {e}")

# AUTH TOOLS
security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    # bcrypt requirement: password must be <= 72 bytes
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# SUPERSET CLIENT
sup = SupersetClient(api_url=SUPERSET_URL, public_url=SUPERSET_PUBLIC_URL)

# VIZ TYPES MAP
VIZ_MAP = {
    "dist_bar": "echarts_timeseries_bar", 
    "bar": "echarts_timeseries_bar",
    "line": "echarts_timeseries_line",
    "pie": "pie",
    "big_number_total": "big_number_total"
}

# MEMORY CACHE
SESSIONS = {}

def ensure_session_in_cache(user_id: str, session_id: str, db: Session):
    """
    Ensures that a session is loaded into the in-memory SESSIONS cache.
    Reconstructs the session from the database if it's missing (e.g., after server restart).
    Strictly verifies user ownership.
    """
    # 1. Initialize user bucket if not exists
    if user_id not in SESSIONS:
        SESSIONS[user_id] = {}
        
    # 2. Check in-memory cache
    if session_id in SESSIONS[user_id]:
        return SESSIONS[user_id][session_id]
        
    # 3. Try to load from DB with ownership check
    session_db = db.query(AnalysisSession).filter(
        AnalysisSession.id == session_id, 
        AnalysisSession.user_id == user_id
    ).first()
    
    if not session_db:
        print(f"DEBUG: Session {session_id} not found or unauthorized for user {user_id}")
        return None
        
    # Reconstruct DF sample (needed for AI context)
    try:
        # Use existing engine or create a new one if needed
        # engine is defined globally at line 46
        df_sample = pd.read_sql(f'SELECT * FROM "{session_db.prefixed_table_name}" LIMIT 20', engine)
    except Exception as e:
        print(f"DEBUG: Error loading table for session {session_id}: {e}")
        df_sample = pd.DataFrame() # Fallback to empty

    # Load history from DB
    msgs_db = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp.asc()).all()
    history = [{"role": m.role, "content": m.content} for m in msgs_db]

    # Re-populate memory cache
    session_data = {
        "df": df_sample,
        "table_name": session_db.table_name,
        "prefixed_table_name": session_db.prefixed_table_name,
        "dataset_id": session_db.dataset_id,
        "dashboard_id": session_db.dashboard_id,
        "messages": history
    }
    
    SESSIONS[user_id][session_id] = session_data
    print(f"DEBUG: Restored session {session_id} for user {user_id} with {len(history)} messages.")
    return session_data

@app.get("/health")
async def health():
    return {"status": "ok", "superset": "connected"}

# Auth Endpoints
@app.post("/api/auth/register")
async def register(
    email: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(...),
    username: str = Form(...),
    db: Session = Depends(get_db)
):
    # Check if user already exists
    existing_user = db.query(User).filter((User.email == email) | (User.username == username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email or username already registered")
    
    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(password)
    new_user = User(
        id=user_id,
        email=email,
        hashed_password=hashed_password,
        full_name=full_name,
        username=username
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(
        data={"sub": new_user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {
        "id": new_user.id,
        "email": new_user.email,
        "full_name": new_user.full_name,
        "username": new_user.username,
        "phone_number": new_user.phone_number
    }}

@app.post("/api/auth/login")
async def login(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token = create_access_token(
        data={"sub": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "username": user.username,
        "phone_number": user.phone_number
    }}

@app.get("/api/auth/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "username": current_user.username,
        "phone_number": current_user.phone_number
    }

@app.patch("/api/auth/profile")
async def update_profile(
    full_name: Optional[str] = Form(None),
    username: Optional[str] = Form(None),
    phone_number: Optional[str] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if full_name:
        current_user.full_name = full_name
    if username:
        # Check if username is already taken by another user
        if username != current_user.username:
            existing = db.query(User).filter(User.username == username).first()
            if existing:
                raise HTTPException(status_code=400, detail="Username already taken")
            current_user.username = username
    if phone_number:
        current_user.phone_number = phone_number
            
    db.commit()
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "username": current_user.username,
        "phone_number": current_user.phone_number
    }

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    table_name: str = Form(...),
    force_new: bool = Form(False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = current_user.id
    try:
        # 1. Check for existing session
        existing_session = db.query(AnalysisSession).filter(
            AnalysisSession.user_id == user_id, 
            AnalysisSession.table_name == table_name
        ).first()
        if existing_session:
            try:
                print(f"DEBUG: Resuming existing session {existing_session.id} for user {user_id}")
                
                # Fetch columns from the database table directly
                engine = create_engine(DB_URI)
                df_sample = pd.read_sql(f'SELECT * FROM "{existing_session.prefixed_table_name}" LIMIT 5', engine)
                
                # Update global SESSIONS cache (for temp compatibility with other endpoints)
                if user_id not in SESSIONS:
                    SESSIONS[user_id] = {}
                SESSIONS[user_id][existing_session.id] = {
                    "df": df_sample,
                    "table_name": existing_session.table_name,
                    "dataset_id": existing_session.dataset_id,
                    "prefixed_table_name": existing_session.prefixed_table_name,
                    "messages": [] # History will be loaded from DB via /history
                }
                
                return {
                    "session_id": existing_session.id,
                    "table_name": existing_session.table_name, # CLEAN NAME
                    "prefixed_table_name": existing_session.prefixed_table_name,
                    "dataset_id": existing_session.dataset_id,
                    "dashboard_url": existing_session.dashboard_url,
                    "columns": df_sample.columns.tolist(),
                    "plan": json.loads(existing_session.analysis_plan) if existing_session.analysis_plan else [],
                    "resumed": True
                }
            except Exception as e:
                print(f"DEBUG: Session resumption failed (table missing?): {e}")
                # Stale metadata, clean it up and redo upload
                db.delete(existing_session)
                db.commit()

        # SANITIZE FOR TABLE NAMES
        user_prefix = "".join(filter(str.isalnum, user_id))
        prefixed_table_name = f"u_{user_prefix}_{table_name}"
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
        
        # NORMALIZE COLS
        def clean_col(c):
            c = str(c).lower().strip()
            c = re.sub(r'[^a-z0-9_]', '_', c)
            c = re.sub(r'_+', '_', c)
            return c.strip('_')
            
        df.columns = [clean_col(c) for c in df.columns]
        
        # DB UPLOAD
        table_exists = sup.check_table_exists(prefixed_table_name)
        if not table_exists or force_new:
            engine = create_engine(DB_URI)
            df.to_sql(prefixed_table_name, engine, if_exists="replace", index=False)
        
        # Register in Superset
        db_id = sup.get_database_id("Supabase_Cloud") or 1
        dataset = sup.create_dataset(database_id=db_id, schema="public", table_name=prefixed_table_name)
        dataset_id = dataset.get("id")
        
        # Ensure Superset metadata is synchronized
        if dataset_id:
            sup.ensure_dataset_synced(dataset_id)
            
        # Analyze with AI
        plan = get_llama_suggestions(df, table_name)
        insights = get_quick_insights(df, table_name)
        
        # SAVE SESSION
        session_id = str(uuid.uuid4())
        new_session = AnalysisSession(
            id=session_id,
            user_id=user_id,
            table_name=table_name,
            prefixed_table_name=prefixed_table_name,
            dataset_id=dataset_id,
            analysis_plan=json.dumps(plan),
            insights=json.dumps(insights) if insights else None
        )
        print(f"Saving session {session_id} with insights status: {bool(insights)}")
        db.add(new_session)
        db.commit()
        
        if user_id not in SESSIONS:
            SESSIONS[user_id] = {}
        SESSIONS[user_id][session_id] = {
            "df": df,
            "table_name": table_name,
            "prefixed_table_name": prefixed_table_name,
            "dataset_id": dataset_id,
            "messages": []
        }
        
        return {
            "session_id": session_id,
            "table_name": table_name, # CLEAN NAME
            "prefixed_table_name": prefixed_table_name,
            "dataset_id": dataset_id,
            "plan": plan,
            "insights": insights,
            "columns": df.columns.tolist()
        }
    except Exception as e:
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
async def create_dashboard(
    session_id: str = Form(...), 
    plan: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = ensure_session_in_cache(current_user.id, session_id, db)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    try:
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
                
                chart_title = f"{chart.get('title', 'AI Chart')} ({current_user.username})"
                print(f"DEBUG: Creating chart '{chart_title}' with params: {params}")
                c_resp = sup.create_chart(dataset_id, chart_title, actual_viz, params)
                if c_resp and c_resp.get("id"):
                    created_chart_ids.append(c_resp.get("id"))
                else:
                    print(f"WARNING: Chart creation failed for '{chart.get('title')}': No ID returned")
            except Exception as chart_err:
                print(f"ERROR: Failed to create chart '{chart.get('title')}': {chart_err}")
                continue
            
        dash_name = f"Dashboard - {table_name} ({current_user.username})"
        dash = sup.create_dashboard(dash_name)
        dash_id = dash.get("id")
        sup.add_charts_to_dashboard(dash_id, created_chart_ids)
        
        # Update Session in DB
        db_id = sup.get_database_id("Supabase_Cloud") or 1
        dash_url = sup.dashboard_url(dash_id)
        
        session_db = db.query(AnalysisSession).filter(AnalysisSession.id == session_id).first()
        if session_db:
            session_db.dashboard_id = dash_id
            session_db.dashboard_url = dash_url
            db.commit()

        return {
            "dashboard_id": dash_id,
            "dashboard_url": dash_url
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/delete-dashboard/{dashboard_id}")
async def delete_dashboard(dashboard_id: int):
    try:
        sup.delete_dashboard(dashboard_id)
        return {"result": "success"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/datasets")
async def get_datasets(current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    try:
        datasets = sup.list_datasets()
        if user_id:
            user_prefix = "".join(filter(str.isalnum, user_id))
            target_prefix = f"u_{user_prefix}_"
            
            cleaned_datasets = []
            for ds in datasets:
                t_name = ds.get("table_name", "")
                if t_name.startswith(target_prefix):
                    # Strip the prefix to get the original name
                    ds["display_name"] = t_name.replace(target_prefix, "", 1)
                    cleaned_datasets.append(ds)
                elif not t_name.startswith("u_"):
                    # Include non-prefixed tables if they exist (though unlikely in this system)
                    ds["display_name"] = t_name
                    cleaned_datasets.append(ds)
            
            return cleaned_datasets
        return datasets
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sessions")
async def get_sessions(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List all previous analysis sessions for the current user."""
    sessions = db.query(AnalysisSession).filter(AnalysisSession.user_id == current_user.id).order_by(AnalysisSession.created_at.desc()).all()
    return [{
        "id": s.id,
        "table_name": s.table_name,
        "prefixed_table_name": s.prefixed_table_name,
        "dashboard_id": s.dashboard_id,
        "dashboard_url": s.dashboard_url,
        "created_at": s.created_at,
        "plan": json.loads(s.analysis_plan) if s.analysis_plan else [],
        "insights": json.loads(s.insights) if s.insights else None
    } for s in sessions]

@app.get("/sessions/{session_id}/history")
async def get_session_history(session_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Fetch chat messages for a specific session."""
    # Check session ownership
    session = db.query(AnalysisSession).filter(AnalysisSession.id == session_id, AnalysisSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or unauthorized")
        
    messages = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp.asc()).all()
    return [{"role": m.role, "content": m.content} for m in messages]

@app.delete("/datasets/{dataset_id}")
async def delete_dataset(dataset_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = current_user.id
    try:
        # Verify ownership
        datasets = sup.list_datasets()
        target_ds = next((ds for ds in datasets if str(ds.get("id")) == str(dataset_id)), None)
        
        if not target_ds:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        user_prefix = "".join(filter(str.isalnum, user_id))
        target_prefix = f"u_{user_prefix}_"
        if not target_ds.get("table_name", "").startswith(target_prefix):
            raise HTTPException(status_code=403, detail="Unauthorized access to this dataset")
            
        table_name = target_ds.get("table_name")
        
        # --- CASCADING DELETE: Charts and Dashboards ---
        try:
            # 1. Find all sessions associated with this specific dataset
            sessions_to_delete = db.query(AnalysisSession).filter(
                AnalysisSession.dataset_id == dataset_id,
                AnalysisSession.user_id == user_id
            ).all()
            
            dashboard_ids = [s.dashboard_id for s in sessions_to_delete if s.dashboard_id]
            session_ids = [s.id for s in sessions_to_delete]

            # 2. Delete associated Dashboards
            # A. Delete by ID from sessions
            deleted_dash_ids = set()
            for d_id in dashboard_ids:
                try:
                    sup.delete_dashboard(d_id)
                    deleted_dash_ids.add(d_id)
                    print(f"DEBUG: Deleted associated dashboard by ID: {d_id}")
                except Exception as dash_err:
                    print(f"WARNING: Could not delete dashboard {d_id}: {dash_err}")

            # B. Fallback: Find and delete by title
            # The app creates dashboards with title: f"Dashboard - {table_name} ({current_user.username})"
            # where table_name is the clean (unprefixed) name.
            clean_name = table_name.replace(target_prefix, "", 1)
            dash_title = f"Dashboard - {clean_name} ({current_user.username})"
            
            dashboards = sup.find_dashboards_by_title(dash_title)
            for dash in dashboards:
                d_id = dash.get("id")
                if d_id and d_id not in deleted_dash_ids:
                    try:
                        sup.delete_dashboard(d_id)
                        print(f"DEBUG: Deleted associated dashboard by title search: {d_id}")
                    except Exception as dash_err:
                        print(f"WARNING: Could not delete dashboard {d_id}: {dash_err}")

            # 3. Find and delete associated Charts
            charts = sup.list_charts_for_dataset(dataset_id)
            for chart in charts:
                try:
                    c_id = chart.get("id")
                    if c_id:
                        sup.delete_chart(c_id)
                        print(f"DEBUG: Deleted associated chart: {c_id}")
                except Exception as chart_err:
                    print(f"WARNING: Could not delete chart {chart.get('id')}: {chart_err}")
        except Exception as cascade_err:
            print(f"WARNING: Error during cascading delete: {cascade_err}")
            # We continue with dataset deletion even if cascading fails partially

        # Delete from Superset
        sup.delete_dataset(dataset_id)
        
        # Delete from DB (Supabase/Postgres)
        if table_name:
            from sqlalchemy import create_engine, text
            engine = create_engine(DB_URI)
            with engine.begin() as conn:
                conn.execute(text(f'DROP TABLE IF EXISTS "{table_name}" CASCADE'))
            
            # --- CASCADING DELETE: DB Metadata (Sessions & Chats) ---
            if session_ids:
                # 2. Delete all chat messages for these sessions
                db.query(ChatMessage).filter(ChatMessage.session_id.in_(session_ids)).delete(synchronize_session=False)
                
                # 3. Delete the sessions themselves
                db.query(AnalysisSession).filter(AnalysisSession.id.in_(session_ids)).delete(synchronize_session=False)
            
            # 4. Cleanup SESSIONS cache
            if user_id in SESSIONS:
                for sid in session_ids:
                    if sid in SESSIONS[user_id]:
                        del SESSIONS[user_id][sid]
                    
            db.commit()
                
        return {"result": "success"}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/datasets/{dataset_id}/data")
async def get_dataset_data(dataset_id: int, current_user: User = Depends(get_current_user)):
    user_id = current_user.id
    try:
        print(f"DEBUG: Fetching data for dataset ID: {dataset_id}")
        # 1. Find the table name and verify ownership
        datasets = sup.list_datasets()
        target_ds = next((ds for ds in datasets if str(ds.get("id")) == str(dataset_id)), None)
        
        if not target_ds:
            raise HTTPException(status_code=404, detail="Dataset not found")
            
        if user_id:
            user_prefix = "".join(filter(str.isalnum, user_id))
            target_prefix = f"u_{user_prefix}_"
            if not target_ds.get("table_name", "").startswith(target_prefix):
                raise HTTPException(status_code=403, detail="Unauthorized access")
            
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
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(
    session_id: str = Form(...), 
    prompt: str = Form(...),
    dashboard_id: Optional[int] = Form(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = ensure_session_in_cache(current_user.id, session_id, db)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    dataset_id = session["dataset_id"]
    # If dashboard_id not provided in request, use the one from the session
    if not dashboard_id:
        dashboard_id = session.get("dashboard_id")
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
        
        # Avoid empty content strings
        assistant_content = result.get("text")
        if not assistant_content:
            if result.get("action") == "create_chart":
                assistant_content = f"### 📊 Chart Created: {result.get('title', 'AI Chart')}\n\nI have successfully planned a new visualization for you."
            else:
                assistant_content = "### ✅ Request Processed\n\nI have processed your request. How else can I assist you with your data today? 🚀"
        
        # Save messages to DB
        user_msg = ChatMessage(session_id=session_id, role="user", content=prompt)
        ai_msg = ChatMessage(session_id=session_id, role="assistant", content=assistant_content)
        db.add_all([user_msg, ai_msg])
        db.commit()
        
        # Update local cache
        session["messages"].append({"role": "user", "content": prompt})
        session["messages"].append({"role": "assistant", "content": assistant_content})
        
        # Ensure dashboard_url is included so the frontend can refresh the full dashboard
        if dashboard_id:
            result["dashboard_url"] = sup.dashboard_url(dashboard_id)
        
        return result
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
