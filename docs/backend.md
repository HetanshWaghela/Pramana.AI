# Backend Documentation

Complete documentation for Pramana.ai's backend architecture, authentication system, and database design.

## Table of Contents

- [Authentication System](#authentication-system)
- [Database Schema](#database-schema)
- [FastAPI Endpoints](#fastapi-endpoints)
- [LangGraph Integration](#langgraph-integration)
- [Data Connectors](#data-connectors)
- [Security](#security)

---

## Authentication System

Pramana.ai uses JWT (JSON Web Tokens) for stateless authentication with bcrypt password hashing.

### Architecture

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ POST /auth/login
       │ {email, password}
       ▼
┌─────────────────────┐
│   FastAPI Server    │
│  (Port 8000)        │
│                     │
│  1. Verify password │
│  2. Generate JWT    │
│  3. Return token    │
└──────┬──────────────┘
       │ JWT Token
       ▼
┌─────────────┐
│  Frontend   │
│ localStorage│
└─────────────┘

Subsequent Requests:
┌─────────────┐
│  Frontend   │
│  + JWT in   │
│  Authorization│
│  header     │
└──────┬──────┘
       │ GET /chats/
       │ Authorization: Bearer <token>
       ▼
┌─────────────────────┐
│   FastAPI Server    │
│                     │
│  1. Decode JWT      │
│  2. Verify signature│
│  3. Extract user_id │
│  4. Query database  │
└─────────────────────┘
```

---

### Implementation Details

#### Password Hashing

**Library:** `passlib` with `bcrypt` backend  
**Cost Factor:** 12 (configurable)

```python
# backend/src/auth/utils.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a plain password using bcrypt."""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    return pwd_context.verify(plain_password, hashed_password)
```

**Security Features:**
- Automatic salt generation
- Constant-time comparison (timing attack resistant)
- Configurable cost factor for future-proofing

---

#### JWT Token Generation

**Library:** `python-jose[cryptography]`  
**Algorithm:** HS256 (HMAC with SHA-256)  
**Expiration:** 7 days (configurable)

```python
# backend/src/auth/utils.py
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 168  # 7 days

def create_access_token(data: dict) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    """Decode and verify a JWT token."""
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    return payload
```

**Token Payload:**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "exp": 1702742400
}
```

---

#### Protected Routes

**Dependency Injection Pattern:**

```python
# backend/src/auth/routes.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get the current authenticated user."""
    token = credentials.credentials
    
    try:
        payload = decode_access_token(token)
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials"
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

# Usage in protected endpoint
@app.get("/chats/")
async def get_user_chats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all chats for the authenticated user."""
    chats = db.query(Chat).filter(Chat.user_id == current_user.id).all()
    return chats
```

---

## Database Schema

Pramana.ai uses **SQLite** for development and **PostgreSQL** for production.

### Entity Relationship Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email (unique)  │
│ name            │
│ hashed_password │
│ is_active       │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │ 1:N
         │
┌────────▼────────┐
│     chats       │
├─────────────────┤
│ id (PK, UUID)   │
│ user_id (FK)    │
│ title           │
│ preview         │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │ 1:N
         │
┌────────▼────────────┐
│   chat_messages     │
├─────────────────────┤
│ id (PK)             │
│ chat_id (FK)        │
│ message_type        │
│ content (TEXT)      │
│ message_id          │
│ created_at          │
└─────────────────────┘
```

---

### Table Definitions

#### users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Auto-incrementing user ID |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `name` | VARCHAR(255) | NOT NULL | User display name |
| `hashed_password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account active status |
| `created_at` | DATETIME | DEFAULT NOW | Account creation timestamp |
| `updated_at` | DATETIME | DEFAULT NOW | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Unique index on `email`

**Example:**
```sql
INSERT INTO users (email, name, hashed_password)
VALUES ('user@example.com', 'John Doe', '$2b$12$...');
```

---

#### chats

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY | UUID for chat |
| `user_id` | INTEGER | FOREIGN KEY (users.id), NOT NULL | Owner of the chat |
| `title` | VARCHAR(255) | NOT NULL, DEFAULT 'New Chat' | Chat title |
| `preview` | VARCHAR(500) | NULL | Preview text (first message) |
| `created_at` | DATETIME | DEFAULT NOW | Chat creation timestamp |
| `updated_at` | DATETIME | DEFAULT NOW | Last message timestamp |

**Indexes:**
- Primary key on `id`
- Index on `user_id` for fast user lookup

**Cascade:**
- `ON DELETE CASCADE` — Deleting user deletes all their chats

**Example:**
```sql
INSERT INTO chats (id, user_id, title)
VALUES ('550e8400-e29b-41d4-a716-446655440000', 1, 'CRISPR Research');
```

---

#### chat_messages

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Auto-incrementing message ID |
| `chat_id` | VARCHAR(36) | FOREIGN KEY (chats.id), NOT NULL | Parent chat |
| `message_type` | VARCHAR(20) | NOT NULL | 'human' or 'ai' |
| `content` | TEXT | NOT NULL | Message content (Markdown supported) |
| `message_id` | VARCHAR(100) | NULL | Optional external ID (LangGraph) |
| `created_at` | DATETIME | DEFAULT NOW | Message timestamp |

**Indexes:**
- Primary key on `id`
- Index on `chat_id` for fast message retrieval

**Cascade:**
- `ON DELETE CASCADE` — Deleting chat deletes all messages

**Example:**
```sql
INSERT INTO chat_messages (chat_id, message_type, content)
VALUES ('550e8400-...', 'human', 'Research CRISPR safety');
```

---

### SQLAlchemy Models

**Location:** `backend/src/auth/models.py`

```python
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    chats = relationship("Chat", back_populates="user", cascade="all, delete-orphan")

class Chat(Base):
    __tablename__ = "chats"
    
    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False, default="New Chat")
    preview = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="chats")
    messages = relationship("ChatMessage", back_populates="chat", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(String(36), ForeignKey("chats.id"), nullable=False, index=True)
    message_type = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    message_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    chat = relationship("Chat", back_populates="messages")
```

---

### Database Migrations

**Development:** SQLAlchemy creates tables automatically on first run.

**Production:** Use Alembic for migrations:

```bash
# Install Alembic
uv pip install alembic

# Initialize (one-time)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Add user table"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

## FastAPI Endpoints

**Base URL:** `http://localhost:8000`  
**Docs:** `http://localhost:8000/docs`

### Authentication Endpoints

See [API Reference](api.md#fastapi-authentication) for complete details.

---

## LangGraph Integration

The backend integrates FastAPI (auth) and LangGraph (agents) as separate servers.

### Why Two Servers?

1. **Separation of Concerns** — Auth logic separate from agent orchestration
2. **Independent Scaling** — Scale agents without affecting auth
3. **LangGraph Ecosystem** — Leverage LangGraph Cloud, Studio, etc.
4. **Hot Reload** — Develop auth and agents independently

---

### Communication Flow

```
┌──────────────┐       ┌────────────────┐       ┌───────────────┐
│   Frontend   │──────>│  FastAPI Auth  │       │   LangGraph   │
│              │       │  (Port 8000)   │       │  (Port 2024)  │
│ 1. Login     │       │                │       │               │
│ 2. Get JWT   │<──────│ Generate token │       │               │
└──────┬───────┘       └────────────────┘       └───────────────┘
       │
       │ 3. Create thread (with JWT in header for tracking)
       ▼
┌──────────────────────────────────────────┐
│          LangGraph API                   │
│  POST /threads                           │
│  POST /threads/{id}/runs                 │
│  GET /threads/{id}/runs/{run_id}/stream │
└──────────────────────────────────────────┘
```

**Note:** LangGraph API itself doesn't require authentication (could be added), but frontend includes JWT for user tracking when saving chats.

---

## Data Connectors

Connectors provide abstraction for data sources in Portfolio Strategist.

### Base Connector Interface

```python
# backend/src/connectors/base.py
from abc import ABC, abstractmethod

class BaseConnector(ABC):
    """Base class for all data connectors."""
    
    @abstractmethod
    async def fetch(self, query: dict) -> dict:
        """Fetch data for the given query."""
        pass
    
    @abstractmethod
    def parse_response(self, response: dict) -> dict:
        """Parse API response into standard format."""
        pass
```

---

### Implemented Connectors

#### 1. IQVIA Connector
**File:** `backend/src/connectors/iqvia.py`  
**Purpose:** Market intelligence and competitive landscape

**Mock Data Returns:**
- Market size and CAGR
- Competitive concentration (HHI)
- Top player shares
- Unmet need scores

#### 2. Clinical Trials Connector
**File:** `backend/src/connectors/trials.py`  
**Purpose:** Live clinical trial data from ClinicalTrials.gov

**Real API:** https://clinicaltrials.gov/api/v2/studies

**Fields:**
- Study title, status, phase
- Sponsor and location
- Enrollment numbers

#### 3. Patents Connector
**File:** `backend/src/connectors/patents.py`  
**Purpose:** Patent landscape analysis

**Mock Data Returns:**
- Patent expiration dates
- FTO (Freedom to Operate) status
- Claim breadth

#### 4. EXIM Connector
**File:** `backend/src/connectors/exim.py`  
**Purpose:** Import/export data

**Mock Data Returns:**
- Import dependency scores
- Local manufacturing opportunities

#### 5. Internal Research Connector
**File:** `backend/src/connectors/internal.py`  
**Purpose:** Proprietary institutional knowledge

#### 6. Web Research Connector
**File:** `backend/src/connectors/web.py`  
**Purpose:** General web search via SerpAPI

---

### Adding New Connectors

```python
# backend/src/connectors/my_connector.py
from .base import BaseConnector

class MyDataConnector(BaseConnector):
    """Connector for MyData API."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
    
    async def fetch(self, query: dict) -> dict:
        # Implement API call
        response = await call_api(query, self.api_key)
        return self.parse_response(response)
    
    def parse_response(self, response: dict) -> dict:
        # Transform to standard format
        return {
            "source": "MyData",
            "data": response["data"],
            "timestamp": datetime.now().isoformat()
        }
```

---

## Security

### Security Best Practices

#### 1. Password Security
- ✅ Bcrypt hashing with cost factor 12
- ✅ Automatic salt generation
- ✅ Constant-time comparison
- ❌ Never log or display passwords

#### 2. JWT Security
- ✅ HS256 signing algorithm
- ✅ Expiration timestamps
- ✅ Secret key from environment variables
- ❌ Never commit secret keys

#### 3. SQL Injection Prevention
- ✅ SQLAlchemy ORM (parameterized queries)
- ✅ Input validation with Pydantic
- ❌ Never concatenate user input into SQL

#### 4. XSS Prevention
- ✅ Frontend auto-escapes user content (React)
- ✅ Content-Type headers set correctly
- ❌ Never use `dangerouslySetInnerHTML` without sanitization

#### 5. CORS Configuration
- ✅ Specific origins in production
- ✅ Credentials support
- ❌ Never use `origins=["*"]` in production

---

### Environment Variable Security

```bash
# ✅ Good - Use secrets management
export GROQ_API_KEY=$(aws secretsmanager get-secret-value --secret-id groq-api-key --query SecretString --output text)

# ❌ Bad - Hardcoded in code
GROQ_API_KEY = "gsk_abc123..."
```

---

## Related Documentation

- [API Reference](api.md) — Complete API documentation
- [Configuration](configuration.md) — Environment setup
- [Architecture](architecture.md) — System architecture
- [Deployment](deployment.md) — Production deployment

---

**Questions?** Check the [Troubleshooting Guide](troubleshooting.md) or open an issue on GitHub.
