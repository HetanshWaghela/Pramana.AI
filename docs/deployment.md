# Deployment

Complete guide for deploying Pramana.ai in development and production environments.

## Table of Contents

- [Development Deployment](#development-deployment)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Environment-Specific Configuration](#environment-specific-configuration)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Scaling](#scaling)

---

## Development Deployment

### Quick Start

Three servers required for full functionality:

#### Option 1: Makefile (Recommended)

```bash
make dev
```

This starts all three servers in parallel.

#### Option 2: Manual Startup (Separate Terminals)

**Terminal 1 — FastAPI Auth Server:**
```bash
cd backend
uvicorn src.auth.routes:app --reload --port 8000
```

**Terminal 2 — LangGraph Agent Server:**
```bash
cd backend
uv run langgraph dev --no-browser --port 2024
```

**Terminal 3 — Vite Frontend:**
```bash
cd frontend
npm run dev
```

---

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend (Landing) | http://localhost:5173 | Main landing page |
| Frontend (Chat) | http://localhost:5173/chat | Chat interface |
| Auth API Docs | http://localhost:8000/docs | FastAPI Swagger UI |
| LangGraph API | http://localhost:2024 | Agent API |
| LangGraph Docs | http://localhost:2024/docs | LangGraph API docs |

---

### First-Time Setup

```bash
# 1. Clone repository
git clone https://github.com/N1KH1LT0X1N/Pharma-Agent.git
cd Pharma-Agent

# 2. Install backend dependencies
cd backend
uv sync

# 3. Configure environment
cp .env.example .env
# Edit .env with your GROQ_API_KEY and SERPAPI_API_KEY

# 4. Install frontend dependencies
cd ../frontend
npm install

# 5. Optional: Install MCP servers globally
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-brave-search

# 6. Start all servers
cd ..
make dev
```

---

## Docker Deployment

### Quick Docker Setup

```bash
# 1. Build image
docker build -t pramana-ai -f Dockerfile .

# 2. Run with Docker Compose
GROQ_API_KEY=xxx SERPAPI_API_KEY=xxx docker-compose up
```

**Access:** http://localhost:8123

---

### Docker Compose Architecture

```yaml
services:
  # Redis — State streaming
  pramana-redis:
    image: redis:6
    healthcheck:
      test: redis-cli ping

  # PostgreSQL — Persistent storage
  pramana-postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: pramana
      POSTGRES_USER: pramana
      POSTGRES_PASSWORD: pramana_secure_password
    volumes:
      - pramana-data:/var/lib/postgresql/data

  # Main application
  pramana-api:
    build: .
    ports:
      - "8123:8080"
    depends_on:
      - pramana-redis
      - pramana-postgres
    environment:
      GROQ_API_KEY: ${GROQ_API_KEY}
      SERPAPI_API_KEY: ${SERPAPI_API_KEY}
      REDIS_URI: redis://pramana-redis:6379
      POSTGRES_URI: postgres://pramana:pramana_secure_password@pramana-postgres:5432/pramana
```

---

### Dockerfile Breakdown

```dockerfile
# Stage 1: Build frontend
FROM node:18 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install UV (Python package manager)
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.cargo/bin:$PATH"

# Copy backend code
COPY backend/ ./backend/
WORKDIR /app/backend

# Install Python dependencies
RUN uv sync

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose ports
EXPOSE 8080

# Start both servers
CMD ["sh", "-c", "uvicorn src.auth.routes:app --host 0.0.0.0 --port 8000 & uv run langgraph start --host 0.0.0.0 --port 2024 & wait"]
```

**Multi-stage build benefits:**
- Smaller final image (no Node.js in production)
- Optimized layer caching
- Fast rebuilds

---

### Docker Commands

```bash
# Build image
docker build -t pramana-ai .

# Run standalone (dev)
docker run -p 8123:8080 \
  -e GROQ_API_KEY=xxx \
  -e SERPAPI_API_KEY=xxx \
  pramana-ai

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f pramana-api

# Stop all containers
docker-compose down

# Remove volumes (reset database)
docker-compose down -v
```

---

## Production Deployment

### Pre-Deployment Checklist

#### Security

- [ ] **Strong JWT Secret** — Generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- [ ] **CORS Origins** — Set to exact frontend URL, never `*`
- [ ] **HTTPS/TLS** — Configure SSL certificates (Let's Encrypt, Cloudflare)
- [ ] **Environment Variables** — Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- [ ] **API Key Rotation** — Regularly rotate Groq, SerpAPI keys
- [ ] **Database Passwords** — Strong, unique passwords
- [ ] **Rate Limiting** — Implement per-endpoint limits

#### Infrastructure

- [ ] **PostgreSQL** — Migrate from SQLite
- [ ] **Redis** — Configure for state streaming
- [ ] **Backups** — Automated database backups
- [ ] **Monitoring** — LangSmith, Sentry, or similar
- [ ] **Logging** — Centralized log aggregation
- [ ] **CDN** — Static asset delivery (CloudFlare, AWS CloudFront)
- [ ] **Load Balancer** — For multiple backend instances

#### Performance

- [ ] **Connection Pooling** — PostgreSQL (PgBouncer)
- [ ] **Redis Clustering** — For distributed state
- [ ] **Worker Scaling** — Multiple LangGraph instances
- [ ] **Frontend Optimization** — Minification, compression, lazy loading
- [ ] **Caching** — API response caching (Redis)

---

### Cloud Deployment Options

#### Option 1: AWS

**Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│ CloudFront CDN (Static Assets)                          │
└───────────────────┬─────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────┐
│ ALB (Application Load Balancer)                         │
└───────────┬─────────────────────────────────────────────┘
            │
    ┌───────┴────────┐
    │                │
┌───▼────────┐ ┌────▼──────┐
│ ECS/Fargate│ │ ECS/Fargate│  (Auto-scaling)
│ Container  │ │ Container  │
└───┬────────┘ └────┬───────┘
    │               │
    └───────┬───────┘
            │
    ┌───────┴────────────┐
    │                    │
┌───▼──────┐      ┌─────▼─────┐
│ ElastiCache │    │    RDS     │
│  (Redis)    │    │(PostgreSQL)│
└─────────────┘    └────────────┘
```

**Services:**
- **Compute:** ECS with Fargate (serverless containers)
- **Database:** RDS PostgreSQL (Multi-AZ)
- **Cache:** ElastiCache Redis (Cluster mode)
- **Storage:** S3 for static assets
- **CDN:** CloudFront
- **Secrets:** AWS Secrets Manager
- **Monitoring:** CloudWatch + LangSmith

**Deployment:**
```bash
# 1. Build and push Docker image to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag pramana-ai:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/pramana-ai:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/pramana-ai:latest

# 2. Update ECS task definition
aws ecs update-service --cluster pramana-cluster --service pramana-service --force-new-deployment
```

---

#### Option 2: Google Cloud Platform (GCP)

**Services:**
- **Compute:** Cloud Run (serverless containers)
- **Database:** Cloud SQL PostgreSQL
- **Cache:** Memorystore Redis
- **Storage:** Cloud Storage
- **CDN:** Cloud CDN
- **Secrets:** Secret Manager
- **Monitoring:** Cloud Monitoring + LangSmith

**Deployment:**
```bash
# Build and deploy to Cloud Run
gcloud builds submit --tag gcr.io/PROJECT_ID/pramana-ai
gcloud run deploy pramana-ai \
  --image gcr.io/PROJECT_ID/pramana-ai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GROQ_API_KEY=${GROQ_API_KEY},SERPAPI_API_KEY=${SERPAPI_API_KEY}
```

---

#### Option 3: DigitalOcean

**Services:**
- **Compute:** App Platform (PaaS) or Droplets + Docker
- **Database:** Managed PostgreSQL
- **Cache:** Managed Redis
- **Storage:** Spaces (S3-compatible)
- **CDN:** Spaces CDN

**Deployment:**
```bash
# Using App Platform (easiest)
# 1. Connect GitHub repository
# 2. Configure build settings
# 3. Add environment variables
# 4. Deploy automatically on git push
```

---

#### Option 4: Self-Hosted (VPS)

**Requirements:**
- Ubuntu 22.04 LTS
- 4+ CPU cores
- 8+ GB RAM
- 50+ GB storage

**Setup:**
```bash
# 1. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 2. Install Docker Compose
sudo apt-get install docker-compose-plugin

# 3. Clone repository
git clone https://github.com/N1KH1LT0X1N/Pharma-Agent.git
cd Pharma-Agent

# 4. Configure environment
cd backend
cp .env.example .env
# Edit .env with production values

# 5. Deploy with Docker Compose
docker-compose up -d

# 6. Configure Nginx reverse proxy
sudo apt-get install nginx
# Configure Nginx (see below)

# 7. Setup SSL with Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

**Nginx Configuration:**
```nginx
# /etc/nginx/sites-available/pramana.ai

server {
    listen 80;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8123;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Environment-Specific Configuration

### Development

```bash
# backend/.env
ENVIRONMENT=development
DEBUG=true
CORS_ORIGINS=*
DATABASE_URL=sqlite:///./pramana.db
REDIS_URI=  # Optional, uses in-memory state
```

### Staging

```bash
# backend/.env
ENVIRONMENT=staging
DEBUG=false
CORS_ORIGINS=https://staging.pramana.ai
DATABASE_URL=postgresql://user:pass@staging-db:5432/pramana
REDIS_URI=redis://staging-redis:6379
LANGSMITH_PROJECT=pramana-ai-staging
```

### Production

```bash
# backend/.env
ENVIRONMENT=production
DEBUG=false
CORS_ORIGINS=https://pramana.ai
DATABASE_URL=postgresql://user:pass@prod-db:5432/pramana
REDIS_URI=redis://prod-redis:6379
LANGSMITH_PROJECT=pramana-ai-production
JWT_SECRET_KEY=<strong-random-key>
RATE_LIMIT_ENABLED=true
```

---

## Monitoring & Maintenance

### Health Checks

**Backend Health:**
```bash
# FastAPI
curl http://localhost:8000/health

# LangGraph
curl http://localhost:2024/health
```

**Database Health:**
```bash
# PostgreSQL
pg_isready -h localhost -p 5432

# Redis
redis-cli ping
```

---

### Monitoring Tools

#### LangSmith (LLM Observability)

**Setup:**
```bash
# backend/.env
LANGSMITH_API_KEY=lsv2_pt_...
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=pramana-ai-production
```

**Dashboard:** https://smith.langchain.com/

**Metrics:**
- Agent execution traces
- LLM token usage and costs
- Tool call success rates
- Error rates and types
- Response times

---

#### Application Monitoring

**Sentry (Error Tracking):**
```bash
pip install sentry-sdk[fastapi]
```

```python
# backend/src/auth/routes.py
import sentry_sdk

sentry_sdk.init(
    dsn="https://...@sentry.io/...",
    traces_sample_rate=1.0,
)
```

---

#### Log Aggregation

**Production Logging:**
```bash
# Use structured JSON logging
pip install python-json-logger
```

```python
# backend/src/config/logging.py
import logging
from pythonjsonlogger import jsonlogger

handler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter()
handler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

**Centralized Logs:**
- AWS CloudWatch Logs
- Google Cloud Logging
- Datadog
- Elasticsearch + Kibana

---

### Backup Strategy

#### Database Backups

**PostgreSQL (Automated):**
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
pg_dump -h localhost -U pramana pramana | gzip > $BACKUP_DIR/pramana_$DATE.sql.gz

# Keep last 30 days
find $BACKUP_DIR -name "pramana_*.sql.gz" -mtime +30 -delete
```

**Add to crontab:**
```bash
# Run daily at 2 AM
0 2 * * * /scripts/backup_postgres.sh
```

#### Redis Persistence

```bash
# redis.conf
save 900 1       # Save after 900 sec if 1 key changed
save 300 10      # Save after 300 sec if 10 keys changed
save 60 10000    # Save after 60 sec if 10000 keys changed
```

---

## Scaling

### Horizontal Scaling

#### Multiple LangGraph Instances

```bash
# Instance 1
PORT=2024 uv run langgraph start

# Instance 2
PORT=2025 uv run langgraph start

# Instance 3
PORT=2026 uv run langgraph start
```

**Load Balancer Configuration (Nginx):**
```nginx
upstream langgraph_backend {
    server localhost:2024;
    server localhost:2025;
    server localhost:2026;
}

server {
    location /threads {
        proxy_pass http://langgraph_backend;
    }
}
```

---

### Vertical Scaling

**Increase Resources:**

Docker Compose:
```yaml
services:
  pramana-api:
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '2.0'
          memory: 4G
```

---

### Database Scaling

**Read Replicas:**
```python
# backend/src/auth/database.py

# Write to master
WRITE_DB = "postgresql://pramana:pass@master:5432/pramana"

# Read from replica
READ_DB = "postgresql://pramana:pass@replica:5432/pramana"
```

**Connection Pooling (PgBouncer):**
```ini
# pgbouncer.ini
[databases]
pramana = host=localhost port=5432 dbname=pramana

[pgbouncer]
listen_addr = 0.0.0.0
listen_port = 6432
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
```

---

### Caching Strategy

**Redis Caching:**
```python
import redis
from functools import wraps

redis_client = redis.from_url(os.getenv("REDIS_URI"))

def cache_result(ttl=3600):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_key = f"{func.__name__}:{args}:{kwargs}"
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
            
            result = await func(*args, **kwargs)
            redis_client.setex(cache_key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator
```

---

## Related Documentation

- [Configuration](configuration.md) — Environment variables and settings
- [Architecture](architecture.md) — System architecture overview
- [Backend](backend.md) — Backend implementation details
- [Troubleshooting](troubleshooting.md) — Common deployment issues

---

**Need help?** Open an issue on GitHub or check the [Troubleshooting Guide](troubleshooting.md).
