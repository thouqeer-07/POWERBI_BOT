@echo off
echo Starting Superset services...
docker-compose up -d

echo Waiting for services to start...
timeout /t 10

echo Initialization might take a minute. Check logs with: docker-compose logs -f superset-init
