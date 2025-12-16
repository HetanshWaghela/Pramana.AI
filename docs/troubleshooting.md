# Troubleshooting Guide

Common issues and their solutions when developing or deploying Pramana.ai.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Server Startup Issues](#server-startup-issues)
- [Authentication Problems](#authentication-problems)
- [Database Issues](#database-issues)
- [API Connection Issues](#api-connection-issues)
- [Agent Execution Errors](#agent-execution-errors)
- [Frontend Build Issues](#frontend-build-issues)
- [Performance Issues](#performance-issues)

---

## Installation Issues

### Python/UV Installation

#### Issue: `uv: command not found`

**Solution:**
```bash
# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.cargo/bin:$PATH"

# Reload shell
source ~/.bashrc  # or source ~/.zshrc
```

---

#### Issue: `Python 3.11+ not found`

**Solution:**

**Ubuntu/Debian:**
```bash
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt-get update
sudo apt-get install python3.11 python3.11-venv
```

**macOS:**
```bash
brew install python@3.11
```

**Windows:**
Download from https://www.python.org/downloads/

---

### Node.js/npm Installation

#### Issue: `npm: command not found`

**Solution:**

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS:**
```bash
brew install node
```

**Windows:**
Download from https://nodejs.org/

---

#### Issue: `npm install` fails with permission errors

**Solution:**

**Linux/macOS:**
```bash
# Fix npm permissions (recommended method)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

**Windows:**
Run command prompt as Administrator

---

## Server Startup Issues

### Backend (LangGraph)

#### Issue: `Error: GROQ_API_KEY not found`

**Symptoms:**
```
KeyError: 'GROQ_API_KEY'
```

**Solution:**
1. Ensure `.env` file exists in `backend/` directory:
   ```bash
   cd backend
   ls -la .env  # Should exist
   ```

2. Check `.env` content:
   ```bash
   cat .env | grep GROQ_API_KEY
   ```

3. Ensure no leading/trailing spaces:
   ```bash
   # Good
   GROQ_API_KEY=gsk_abc123...
   
   # Bad
   GROQ_API_KEY = gsk_abc123...  # Spaces around =
   ```

4. Restart backend after editing `.env`

---

#### Issue: `Port 2024 already in use`

**Symptoms:**
```
Error: bind EADDRINUSE: address already in use 0.0.0.0:2024
```

**Solution:**

**Find process using port:**

**Linux/macOS:**
```bash
lsof -i :2024
# Output: PID of process

# Kill process
kill -9 <PID>
```

**Windows:**
```powershell
netstat -ano | findstr :2024
# Output: PID in last column

# Kill process
taskkill /PID <PID> /F
```

**Alternative:** Use different port:
```bash
PORT=2025 uv run langgraph dev
```

---

#### Issue: `ModuleNotFoundError: No module named 'langgraph'`

**Solution:**
```bash
cd backend
uv sync  # Re-install dependencies
```

If still fails:
```bash
# Verify UV environment
uv pip list

# Reinstall LangGraph
uv pip install langgraph
```

---

### Frontend (Vite)

#### Issue: `Port 5173 already in use`

**Solution:**

**Option 1: Kill existing process** (see port conflict solution above)

**Option 2: Use different port:**
```bash
# Edit vite.config.ts
export default defineConfig({
  server: {
    port: 5174  // Or any other port
  }
})
```

---

#### Issue: `Module not found: Can't resolve '@/components/...'`

**Solution:**

1. Check `tsconfig.json` has path alias:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. Restart Vite dev server:
   ```bash
   # Ctrl+C to stop, then
   npm run dev
   ```

---

## Authentication Problems

### Login Issues

#### Issue: "Invalid credentials" but credentials are correct

**Symptoms:**
- Correct email/password returns 401 Unauthorized
- Database shows user exists

**Solution:**

1. **Check database connection:**
   ```bash
   cd backend
   ls -la pramana.db  # Should exist
   ```

2. **Verify password hashing:**
   ```python
   # Test script: backend/test_auth.py
   from src.auth.utils import verify_password
   from src.auth.models import User
   from src.auth.database import SessionLocal
   
   db = SessionLocal()
   user = db.query(User).filter(User.email == "test@example.com").first()
   
   if user:
       is_valid = verify_password("your_password", user.hashed_password)
       print(f"Password valid: {is_valid}")
   else:
       print("User not found")
   ```

3. **Reset password:**
   ```python
   # backend/reset_password.py
   from src.auth.utils import hash_password
   from src.auth.models import User
   from src.auth.database import SessionLocal
   
   db = SessionLocal()
   user = db.query(User).filter(User.email == "test@example.com").first()
   
   if user:
       user.hashed_password = hash_password("new_password_123")
       db.commit()
       print("Password reset successful")
   ```

---

#### Issue: "Token expired" immediately after login

**Solution:**

1. **Check system clock** — JWT uses timestamps
   ```bash
   date  # Should show correct time
   ```

2. **Adjust token expiration:**
   ```python
   # backend/src/auth/utils.py
   ACCESS_TOKEN_EXPIRE_HOURS = 168  # 7 days (increase if needed)
   ```

3. **Clear localStorage and re-login:**
   ```javascript
   // Browser console
   localStorage.clear();
   // Then login again
   ```

---

### Registration Issues

#### Issue: "Email already exists" for new user

**Solution:**

1. **Check if user exists:**
   ```bash
   cd backend
   sqlite3 pramana.db "SELECT * FROM users WHERE email = 'test@example.com';"
   ```

2. **Delete user if needed:**
   ```bash
   sqlite3 pramana.db "DELETE FROM users WHERE email = 'test@example.com';"
   ```

3. **Or use different email**

---

## Database Issues

### SQLite Issues

#### Issue: Database file not created

**Symptoms:**
- `pramana.db` not found in `backend/` directory
- Login/register fails with database errors

**Solution:**

1. **Ensure proper directory:**
   ```bash
   cd backend
   pwd  # Should show .../backend
   ```

2. **Manually trigger database creation:**
   ```python
   # Run in backend directory
   python -c "from src.auth.database import Base, engine; Base.metadata.create_all(bind=engine)"
   ```

3. **Check file permissions:**
   ```bash
   ls -la pramana.db
   # Should be readable/writable
   
   # Fix if needed
   chmod 644 pramana.db
   ```

---

#### Issue: "Database is locked"

**Symptoms:**
```
sqlite3.OperationalError: database is locked
```

**Solution:**

1. **Close all connections:**
   - Stop all backend processes
   - Close any SQLite browser tools

2. **Remove lock file:**
   ```bash
   rm pramana.db-journal
   rm pramana.db-shm
   rm pramana.db-wal
   ```

3. **Restart backend**

---

### PostgreSQL Issues (Production)

#### Issue: "Connection refused" to PostgreSQL

**Solution:**

1. **Verify PostgreSQL is running:**
   ```bash
   # Linux
   sudo systemctl status postgresql
   
   # macOS
   brew services list | grep postgresql
   ```

2. **Check connection string:**
   ```bash
   # backend/.env
   POSTGRES_URI=postgresql://pramana:password@localhost:5432/pramana
   #              ↑        ↑          ↑           ↑       ↑
   #           username  password    host        port   database
   ```

3. **Test connection:**
   ```bash
   psql -h localhost -U pramana -d pramana
   # Enter password when prompted
   ```

4. **Check pg_hba.conf authentication:**
   ```bash
   # Usually in /etc/postgresql/*/main/pg_hba.conf
   # Should have:
   local   all   pramana   md5
   host    all   pramana   127.0.0.1/32   md5
   ```

---

## API Connection Issues

### LangGraph API

#### Issue: "Failed to fetch" when calling LangGraph API

**Symptoms:**
```
TypeError: Failed to fetch
```

**Solution:**

1. **Verify LangGraph server is running:**
   ```bash
   curl http://localhost:2024/health
   # Should return: {"status": "ok"}
   ```

2. **Check CORS configuration:**
   ```python
   # backend/src/agent/app.py (if using custom FastAPI wrapper)
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"]
   )
   ```

3. **Check API URL in frontend:**
   ```typescript
   // frontend/src/lib/chatService.ts
   const LANGGRAPH_API = 'http://localhost:2024';  // Verify this
   ```

---

### SerpAPI Issues

#### Issue: "SerpAPI key invalid" or "Daily quota exceeded"

**Solution:**

1. **Verify API key:**
   ```bash
   # backend/.env
   cat .env | grep SERPAPI_API_KEY
   ```

2. **Test API key:**
   ```bash
   curl "https://serpapi.com/account.json?api_key=YOUR_API_KEY"
   ```

3. **Check quota:**
   - Visit https://serpapi.com/dashboard
   - Free tier: 100 searches/month

4. **Alternative: Use Brave Search MCP** (see [Configuration](configuration.md#brave-search-mcp-server))

---

## Agent Execution Errors

### Deep Researcher

#### Issue: "No search results found"

**Possible Causes:**
1. SerpAPI quota exceeded
2. Network issues
3. Invalid search query

**Solution:**

1. **Check SerpAPI status:**
   ```bash
   curl "https://serpapi.com/status.json"
   ```

2. **Enable debug logging:**
   ```python
   # backend/src/agent/deep_researcher.py
   import logging
   logging.basicConfig(level=logging.DEBUG)
   ```

3. **Test with simpler query:**
   - Try: "COVID-19 vaccine"
   - Instead of: "Phase 3 clinical trials for mRNA vaccines targeting SARS-CoV-2 in pediatric populations"

---

### Portfolio Strategist

#### Issue: "Connector timeout"

**Solution:**

1. **Increase timeout:**
   ```python
   # backend/src/agent/portfolio/config.py
   CONNECTOR_TIMEOUT = 60  # seconds (increase from 30)
   ```

2. **Check mock data connectors:**
   ```python
   # Verify mock data is being returned
   # backend/src/connectors/iqvia.py
   # Should have mock data defined
   ```

---

### Math Agent

#### Issue: "Invalid expression" for valid math

**Solution:**

1. **Check allowed functions:**
   ```python
   # backend/src/tools/calculator.py
   ALLOWED_FUNCTIONS = {
       'sqrt', 'sin', 'cos', 'tan',
       'log', 'exp', 'pi', 'e'
   }
   ```

2. **Use proper syntax:**
   ```python
   # Good
   "sqrt(16)"
   "2 * pi * 5"
   
   # Bad
   "√16"  # Use sqrt() instead
   "2π"   # Use 2 * pi
   ```

---

## Frontend Build Issues

### Build Errors

#### Issue: "TypeScript type errors" during build

**Solution:**

1. **Check for type errors:**
   ```bash
   npx tsc --noEmit
   ```

2. **Fix type errors** or use type assertion:
   ```typescript
   // Temporary workaround (not recommended)
   const value = someValue as any;
   ```

3. **Update type definitions:**
   ```bash
   npm install --save-dev @types/react @types/react-dom
   ```

---

#### Issue: "Out of memory" during build

**Solution:**

1. **Increase Node.js memory:**
   ```bash
   # In package.json
   {
     "scripts": {
       "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
     }
   }
   ```

2. **Or set environment variable:**
   ```bash
   export NODE_OPTIONS=--max-old-space-size=4096
   npm run build
   ```

---

## Performance Issues

### Slow Agent Response

#### Issue: Agent takes too long to respond

**Possible Causes:**
1. Complex query requiring multiple loops
2. Slow external API (SerpAPI, ClinicalTrials.gov)
3. Insufficient system resources

**Solution:**

1. **Reduce research loops:**
   ```python
   # backend/src/agent/deep_researcher.py
   MAX_RESEARCH_LOOPS = 1  # Reduce from 2
   ```

2. **Use faster model:**
   ```python
   # Use LLaMA 3.1 8B instead of 70B
   REASONING_MODEL = "llama-3.1-8b-instant"
   ```

3. **Monitor LangSmith traces:**
   - Identify slowest steps
   - Optimize accordingly

---

### High Memory Usage

#### Issue: Backend consuming too much memory

**Solution:**

1. **Limit concurrent agents:**
   ```python
   # Reduce parallel workers in Portfolio Strategist
   MAX_PARALLEL_WORKERS = 3  # Reduce from 6
   ```

2. **Clear LangGraph state:**
   ```bash
   # If using Redis
   redis-cli FLUSHDB
   ```

3. **Restart services periodically:**
   ```bash
   # Automated restart with systemd or cron
   ```

---

## Getting More Help

### Enable Debug Logging

**Backend:**
```python
# backend/src/agent/app.py
import logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
```

**Frontend:**
```typescript
// frontend/src/lib/chatService.ts
console.log('API Request:', request);
console.log('API Response:', response);
```

---

### Check Logs

**LangGraph Server:**
```bash
cd backend
uv run langgraph dev 2>&1 | tee langgraph.log
# Logs saved to langgraph.log
```

**FastAPI Server:**
```bash
uvicorn src.auth.routes:app --reload --log-level debug
```

---

### Common Error Patterns

| Error Message | Likely Cause | Solution |
|---------------|--------------|----------|
| `ECONNREFUSED` | Server not running | Start the server |
| `401 Unauthorized` | Invalid/expired JWT | Re-login |
| `CORS error` | CORS not configured | Check CORS settings |
| `Module not found` | Missing dependency | Run `uv sync` or `npm install` |
| `Port in use` | Process already running | Kill process or use different port |
| `Database locked` | Concurrent writes (SQLite) | Use PostgreSQL for production |

---

## Still Stuck?

1. **Search GitHub Issues:** https://github.com/N1KH1LT0X1N/Pharma-Agent/issues
2. **Open New Issue:** Include:
   - Error message (full traceback)
   - Steps to reproduce
   - Environment (OS, Python/Node versions)
   - Relevant configuration (.env variables, anonymized)
3. **Check Documentation:**
   - [Architecture](architecture.md)
   - [Configuration](configuration.md)
   - [Development](development.md)

---

**Happy debugging! 🐛🔍**
