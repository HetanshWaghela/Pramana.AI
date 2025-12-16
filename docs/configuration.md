# Configuration

Complete configuration guide for Pramana.ai, covering environment variables, model selection, MCP servers, and deployment settings.

## Table of Contents

- [Environment Variables](#environment-variables)
- [Model Configuration](#model-configuration)
- [MCP Server Configuration](#mcp-server-configuration)
- [Database Configuration](#database-configuration)
- [Frontend Configuration](#frontend-configuration)
- [Production Settings](#production-settings)

---

## Environment Variables

All backend configuration is managed through environment variables defined in `backend/.env`.

### Setup

```bash
# Copy example configuration
cd backend
cp .env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

---

### Required Variables

#### Groq API (Required)

```bash
# LLM inference provider
GROQ_API_KEY=your_groq_api_key_here
```

**Get your key:** https://console.groq.com/keys

**Usage:** All AI agents use Groq for LLM inference  
**Models:** LLaMA 3.3 70B, LLaMA 3.1 70B, LLaMA 3.1 8B

---

#### SerpAPI (Required for Deep Researcher)

```bash
# Web search provider
SERPAPI_API_KEY=your_serpapi_api_key_here
```

**Get your key:** https://serpapi.com/

**Usage:** Deep Researcher agent for web research  
**Alternative:** Use Brave Search MCP server (see [MCP Configuration](#brave-search-mcp-server))

---

### Optional Variables

#### LangSmith (Monitoring & Debugging)

```bash
# LangChain observability platform
LANGSMITH_API_KEY=your_langsmith_api_key_here
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=pramana-ai
```

**Get your key:** https://smith.langchain.com/

**Features:**
- Trace agent execution steps
- Debug LLM calls and tool usage
- Monitor performance metrics
- Visualize agent graphs

---

#### Database (Production)

```bash
# Redis for state streaming
REDIS_URI=redis://localhost:6379

# PostgreSQL for persistence
POSTGRES_URI=postgresql://pramana:secure_password@localhost:5432/pramana
```

**Development:** Uses in-memory state and SQLite  
**Production:** Requires Redis + PostgreSQL

---

#### JWT Authentication

```bash
# JWT secret key (auto-generated if not provided)
JWT_SECRET_KEY=your_random_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168  # 7 days
```

**Security:** Generate a strong random key:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

#### CORS Configuration

```bash
# Allowed origins for CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Development:** `*` (allow all)  
**Production:** Specify exact frontend URLs

---

### Complete .env Example

```bash
# ══════════════════════════════════════════════════════════════════════════════
# Pramana.ai - Environment Configuration
# ══════════════════════════════════════════════════════════════════════════════

# ──────────────────────────────────────────────────────────────────────────────
# REQUIRED - AI Provider
# ──────────────────────────────────────────────────────────────────────────────
GROQ_API_KEY=gsk_abc123...

# ──────────────────────────────────────────────────────────────────────────────
# REQUIRED - Web Search (for Deep Researcher agent)
# ──────────────────────────────────────────────────────────────────────────────
SERPAPI_API_KEY=abc123...

# ──────────────────────────────────────────────────────────────────────────────
# OPTIONAL - Monitoring & Observability
# ──────────────────────────────────────────────────────────────────────────────
LANGSMITH_API_KEY=lsv2_pt_...
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=pramana-ai

# ──────────────────────────────────────────────────────────────────────────────
# OPTIONAL - Production Infrastructure
# ──────────────────────────────────────────────────────────────────────────────
REDIS_URI=redis://localhost:6379
POSTGRES_URI=postgresql://pramana:secure_password@localhost:5432/pramana

# ──────────────────────────────────────────────────────────────────────────────
# OPTIONAL - Authentication
# ──────────────────────────────────────────────────────────────────────────────
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168

# ──────────────────────────────────────────────────────────────────────────────
# OPTIONAL - MCP Server Configuration
# ──────────────────────────────────────────────────────────────────────────────
# Filesystem MCP Server
MCP_FILESYSTEM_ENABLED=true
MCP_FILESYSTEM_PATH=/app/workspace

# Brave Search MCP Server
MCP_BRAVE_SEARCH_ENABLED=false
BRAVE_API_KEY=your_brave_api_key_here
```

---

## Model Configuration

### Available Models

Pramana.ai uses Groq's optimized LLaMA models:

| Model ID | Name | Parameters | Speed | Best For |
|----------|------|------------|-------|----------|
| `llama-3.3-70b-versatile` | LLaMA 3.3 70B | 70B | Fast | Complex reasoning, research, multi-step tasks |
| `llama-3.1-70b-versatile` | LLaMA 3.1 70B | 70B | Fast | Balanced performance |
| `llama-3.1-8b-instant` | LLaMA 3.1 8B | 8B | Fastest | Simple tasks, quick responses |

**Default:** All agents use `llama-3.3-70b-versatile`

---

### Changing Agent Models

#### Option 1: Configuration in Code

Edit agent-specific configuration files:

**Deep Researcher:**
```python
# backend/src/agent/deep_researcher.py

REASONING_MODEL = "llama-3.3-70b-versatile"  # Query generation, reflection
RESPONSE_MODEL = "llama-3.3-70b-versatile"   # Final synthesis
```

**Portfolio Strategist:**
```python
# backend/src/agent/portfolio/config.py

ANALYSIS_MODEL = "llama-3.3-70b-versatile"
SYNTHESIS_MODEL = "llama-3.3-70b-versatile"
```

**Chat Assistant:**
```python
# backend/src/agent/chatbot_graph.py

CHAT_MODEL = "llama-3.3-70b-versatile"
```

---

#### Option 2: Runtime Configuration

Pass model configuration via LangGraph API:

```json
{
  "assistant_id": "deep_researcher",
  "input": {...},
  "config": {
    "configurable": {
      "reasoning_model": "llama-3.1-8b-instant",
      "response_model": "llama-3.3-70b-versatile"
    }
  }
}
```

---

### Model Selection Guide

#### Complex Research Tasks
**Recommended:** `llama-3.3-70b-versatile`
- Multi-source synthesis
- Deep analysis
- Citation extraction
- Portfolio opportunity scoring

#### Quick Q&A
**Recommended:** `llama-3.1-8b-instant`
- Simple questions
- Fast responses
- Casual conversation

#### Balanced Workloads
**Recommended:** `llama-3.1-70b-versatile`
- General purpose
- Good speed/quality trade-off

---

## MCP Server Configuration

Model Context Protocol (MCP) servers provide external tool integrations.

### Configuration File

Edit [backend/src/config/mcp_config.py](../backend/src/config/mcp_config.py):

```python
import os

MCP_SERVERS = [
    {
        "name": "filesystem",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/app/workspace"],
        "env": {},
        "enabled": os.getenv("MCP_FILESYSTEM_ENABLED", "true").lower() == "true"
    },
    {
        "name": "brave-search",
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-brave-search"],
        "env": {"BRAVE_API_KEY": os.getenv("BRAVE_API_KEY", "")},
        "enabled": os.getenv("MCP_BRAVE_SEARCH_ENABLED", "false").lower() == "true"
    }
]
```

---

### Filesystem MCP Server

**Purpose:** File and directory operations with sandboxed access

**Installation:**
```bash
npm install -g @modelcontextprotocol/server-filesystem
```

**Configuration:**
```bash
# backend/.env
MCP_FILESYSTEM_ENABLED=true
MCP_FILESYSTEM_PATH=/app/workspace  # Sandbox root directory
```

**Capabilities:**
- `read_file` — Read file contents
- `write_file` — Write to files
- `list_directory` — List directory contents
- `create_directory` — Create directories
- `move_file` — Move/rename files
- `delete_file` — Delete files

**Security:** All operations are sandboxed to `MCP_FILESYSTEM_PATH`

---

### Brave Search MCP Server

**Purpose:** Web search alternative to SerpAPI

**Installation:**
```bash
npm install -g @modelcontextprotocol/server-brave-search
```

**Configuration:**
```bash
# backend/.env
MCP_BRAVE_SEARCH_ENABLED=true
BRAVE_API_KEY=your_brave_api_key_here
```

**Get API Key:** https://brave.com/search/api/

**Capabilities:**
- `brave_web_search` — General web search
- `brave_local_search` — Location-based search
- `brave_news_search` — News articles

---

### Adding Custom MCP Servers

1. **Install the MCP server:**
   ```bash
   npm install -g @modelcontextprotocol/server-[name]
   ```

2. **Add to configuration:**
   ```python
   # backend/src/config/mcp_config.py
   
   MCP_SERVERS.append({
       "name": "my_custom_server",
       "command": "npx",
       "args": ["-y", "@modelcontextprotocol/server-my-custom"],
       "env": {
           "API_KEY": os.getenv("MY_CUSTOM_API_KEY", "")
       },
       "enabled": os.getenv("MCP_MY_CUSTOM_ENABLED", "false").lower() == "true"
   })
   ```

3. **Add environment variable:**
   ```bash
   # backend/.env
   MCP_MY_CUSTOM_ENABLED=true
   MY_CUSTOM_API_KEY=your_api_key_here
   ```

4. **Restart backend:**
   ```bash
   cd backend && uv run langgraph dev --no-browser
   ```

---

## Database Configuration

### Development (Default)

**Database:** SQLite  
**Location:** `backend/pramana.db`  
**State:** In-memory (LangGraph)

**No configuration required** — SQLite database is created automatically on first run.

---

### Production

**Database:** PostgreSQL  
**State:** Redis

#### PostgreSQL Setup

```bash
# 1. Install PostgreSQL
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# 2. Create database and user
sudo -u postgres psql
CREATE DATABASE pramana;
CREATE USER pramana WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE pramana TO pramana;
\q

# 3. Configure environment
# backend/.env
POSTGRES_URI=postgresql://pramana:secure_password@localhost:5432/pramana
```

#### Redis Setup

```bash
# 1. Install Redis
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# 2. Start Redis
redis-server

# 3. Configure environment
# backend/.env
REDIS_URI=redis://localhost:6379
```

---

### Database Schema

See [Backend Documentation](backend.md#database-schema) for complete schema details.

---

## Frontend Configuration

### Environment Variables

Frontend configuration is managed in [frontend/vite.config.ts](../frontend/vite.config.ts):

```typescript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
```

### API Endpoints

Edit [frontend/src/lib/chatService.ts](../frontend/src/lib/chatService.ts):

```typescript
// API base URLs
const LANGGRAPH_API = 'http://localhost:2024';
const AUTH_API = 'http://localhost:8000';
```

**Production:** Use environment-specific URLs:

```typescript
const LANGGRAPH_API = import.meta.env.VITE_LANGGRAPH_API || 'http://localhost:2024';
const AUTH_API = import.meta.env.VITE_AUTH_API || 'http://localhost:8000';
```

---

## Production Settings

### Security Checklist

- [ ] **Strong JWT Secret** — Generate with `secrets.token_urlsafe(32)`
- [ ] **CORS Origins** — Specify exact frontend URLs, never use `*`
- [ ] **HTTPS** — Enable TLS certificates
- [ ] **Rate Limiting** — Implement per-endpoint limits
- [ ] **Database Password** — Use strong, unique passwords
- [ ] **Environment Variables** — Never commit `.env` to version control
- [ ] **API Key Rotation** — Regularly rotate Groq, SerpAPI keys

---

### Performance Tuning

#### Backend

```bash
# backend/.env

# Increase worker threads for parallel execution
LANGCHAIN_WORKER_THREADS=8

# Connection pooling
POSTGRES_POOL_SIZE=20
POSTGRES_MAX_OVERFLOW=10

# Redis connection pool
REDIS_MAX_CONNECTIONS=50
```

#### Frontend

```typescript
// frontend/vite.config.ts

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', '@radix-ui/react-dialog'],
          'chart-vendor': ['recharts']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

---

### Monitoring & Logging

#### LangSmith Integration

```bash
# backend/.env
LANGSMITH_API_KEY=lsv2_pt_...
LANGSMITH_TRACING=true
LANGSMITH_PROJECT=pramana-ai-production
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
```

**Dashboard:** https://smith.langchain.com/

**Features:**
- Real-time trace visualization
- LLM cost tracking
- Performance analytics
- Error monitoring

---

### Scaling Configuration

#### Horizontal Scaling

**LangGraph Server:**
```bash
# Run multiple instances behind load balancer
# Instance 1
PORT=2024 uv run langgraph dev

# Instance 2
PORT=2025 uv run langgraph dev

# Instance 3
PORT=2026 uv run langgraph dev
```

**Redis Cluster:**
```bash
# Use Redis Cluster for distributed state
REDIS_URI=redis://node1:6379,redis://node2:6379,redis://node3:6379
```

**PostgreSQL:**
- Connection pooling with PgBouncer
- Read replicas for analytics queries
- Partitioning for large message tables

---

## Configuration Validation

### Verify Configuration

```bash
# Check environment variables are loaded
cd backend
uv run python -c "import os; print(os.getenv('GROQ_API_KEY'))"

# Test database connection
uv run python -c "from src.auth.database import engine; engine.connect()"

# Test LangGraph configuration
uv run langgraph test
```

---

### Common Issues

**"GROQ_API_KEY not found"**
- Ensure `.env` file exists in `backend/` directory
- Check spelling and format
- Restart backend after editing `.env`

**"Database connection failed"**
- Verify PostgreSQL is running: `pg_isready`
- Check connection string format
- Ensure database and user exist

**"Redis connection refused"**
- Start Redis: `redis-server`
- Check Redis is running: `redis-cli ping`
- Verify Redis URI in `.env`

---

## Related Documentation

- [Architecture](architecture.md) — System architecture overview
- [Deployment](deployment.md) — Production deployment guide
- [Backend](backend.md) — Backend implementation details
- [Troubleshooting](troubleshooting.md) — Common errors and fixes

---

**Questions?** Open an issue on GitHub or check the [Troubleshooting Guide](troubleshooting.md).
