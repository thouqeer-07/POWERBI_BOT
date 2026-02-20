import os

# Database
SQLALCHEMY_DATABASE_URI = os.getenv("SUPERSET_DB_URI", "").strip() or None

# Security
SECRET_KEY = os.getenv("SUPERSET_SECRET_KEY", "").strip() or None

# Feature Flags
FEATURE_FLAGS = {
    "ENABLE_TEMPLATE_PROCESSING": True,
    "ENABLE_API_KEY": True,
    "ENABLE_JWT_TOKEN": True,
    "ALLOW_SELF_REGISTER": False, 
    "EMBEDDED_SUPERSET": True,
    "GENERIC_CHART_AXES": True, # Allow non-time x-axis for ECharts
    "ENABLE_GUEST_TOKEN": True,
    "DASHBOARD_CACHE_FOR_USER": True,
    "ENABLE_EMBEDDED_RESOURCE_ACCESS_CONTROL": True, # Needed for Guest Tokens
}
GUEST_TOKEN_JWT_EXP_SECONDS = 3600 # 1 hour

# --- Caching Optimization (Redis) ---
REDIS_HOST = os.getenv("REDIS_HOST", "redis")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")

CACHE_CONFIG = {
    'CACHE_TYPE': 'RedisCache',
    'CACHE_DEFAULT_TIMEOUT': 86400,
    'CACHE_KEY_PREFIX': 'superset_results',
    'CACHE_REDIS_HOST': REDIS_HOST,
    'CACHE_REDIS_PORT': REDIS_PORT,
}

DATA_CACHE_CONFIG = CACHE_CONFIG
FILTER_STATE_CACHE_CONFIG = CACHE_CONFIG
EXPLORE_FORM_DATA_CACHE_CONFIG = CACHE_CONFIG

# Authentication & Roles
AUTH_TYPE = 1  # Database Authentication
AUTH_ROLE_ADMIN = "Admin"
AUTH_ROLE_PUBLIC = "Public"
PUBLIC_ROLE_LIKE = "Gamma" 
PUBLIC_ROLE_LIKE_GAMMA = True
GUEST_ROLE_NAME = "Public"
AUTH_USER_REGISTRATION = True
AUTH_USER_REGISTRATION_ROLE = "Public"

# Security Configurations
ENABLE_PROXY_FIX = True
WTF_CSRF_ENABLED = False 
TALISMAN_ENABLED = False 
SESSION_COOKIE_SAMESITE = "None"
SESSION_COOKIE_SECURE = True
SESSION_COOKIE_HTTPONLY = True

# Embedding / CORS
ENABLE_CORS = True
CORS_OPTIONS = {
    'supports_credentials': True,
    'allow_headers': ['*'],
    'resources': {r"/*": {"origins": "*"}},
}

# Proxy / Cloudflare Configuration
PROXY_FIX_CONFIG = {
    "x_for": 1, 
    "x_proto": 1, 
    "x_host": 1, 
    "x_port": 1, 
    "x_prefix": 1
}

# Talisman Config
TALISMAN_CONFIG = {
    "content_security_policy": None,
    "force_https": False,
    "force_file_save": False,
    "session_cookie_secure": True,
    "session_cookie_samesite": "None",
}

PREVENT_UNSAFE_REDIRECTS = False
PREFERRED_URL_SCHEME = 'https'
OVERRIDE_HTTP_HEADERS = {'X-Frame-Options': 'ALLOWALL'}
HTTP_HEADERS = {'X-Frame-Options': 'ALLOWALL', 'X-Content-Type-Options': 'nosniff'} 

# Performance Tuning
DASHBOARD_RBAC = False
ROW_LIMIT = 5000
SUPERSET_WEBSERVER_THREADS = 16
SUPERSET_WEBSERVER_TIMEOUT = 120
