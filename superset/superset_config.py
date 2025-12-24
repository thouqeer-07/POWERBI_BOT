import os

# Database
SQLALCHEMY_DATABASE_URI = "postgresql://postgres.fqsbogzwdkskktmgloui:Thouqeer07supbase@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"

# Security
SECRET_KEY = os.getenv("SUPERSET_SECRET_KEY", "your_secret_key_here_please_change_it")

# Feature Flags
FEATURE_FLAGS = {
    "ENABLE_TEMPLATE_PROCESSING": True,
    "ENABLE_API_KEY": True,
    "ENABLE_JWT_TOKEN": True,
    "ALLOW_SELF_REGISTER": False, 
    "EMBEDDED_SUPERSET": True,
    "GENERIC_CHART_AXES": True, # Allow non-time x-axis for ECharts
}

# REQUIRED for API key UI to appear
AUTH_TYPE = 1  # Database Authentication
AUTH_ROLE_ADMIN = "Admin"
AUTH_ROLE_PUBLIC = "Public"
PUBLIC_ROLE_LIKE = "Admin" # Temporary test: Use Admin instead of Gamma
PUBLIC_ROLE_LIKE_GAMMA = True
GUEST_ROLE_NAME = "Public"
AUTH_USER_REGISTRATION = True
AUTH_USER_REGISTRATION_ROLE = "Public"
# Enable API auth
ENABLE_PROXY_FIX = True
WTF_CSRF_ENABLED = False 
TALISMAN_ENABLED = False
# Critical for iframe login on different domains (e.g. Streamlit Cloud embedding Superset)
SESSION_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SECURE = True

# Embedding / CORS
TALISMAN_ENABLED = False
WTF_CSRF_ENABLED = False 
ENABLE_CORS = True
CORS_OPTIONS = {
    'supports_credentials': True,
    'allow_headers': ['*'],
    'resources': {r"/api/*": {"origins": "*"}},
}

# TALISMAN_CONFIG must be set even if enabled is false sometimes, or to be safe
TALISMAN_CONFIG = {
    "content_security_policy": None,
    "force_https": False,
    "force_file_save": False,
}
OVERRIDE_HTTP_HEADERS = {'X-Frame-Options': 'ALLOWALL'}
HTTP_HEADERS = {'X-Frame-Options': 'ALLOWALL', 'X-Content-Type-Options': 'nosniff'} 
# PREVENT_UNSAFE_REDIRECTS = False # Try if needed

# Other
ROW_LIMIT = 5000
SUPERSET_WEBSERVER_THREADS = 2
