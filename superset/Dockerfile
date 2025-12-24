FROM apache/superset:latest
USER root
RUN /app/.venv/bin/python -m pip install --no-cache-dir psycopg2-binary flask-cors
COPY superset_config.py /app/pythonpath/superset_config.py
USER superset
