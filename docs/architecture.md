# Architecture

This document provides a comprehensive overview of Pramana.ai's system architecture, technology stack, and design decisions.

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Infrastructure](#infrastructure)
- [Project Structure](#project-structure)
- [Design Patterns](#design-patterns)

---

## System Overview

Pramana.ai is a full-stack AI research platform built with a decoupled frontend-backend architecture:

```
┌─────────────────────────────────────────────────────────────────┐
│                   Browser (User Interface)                       │
│              React 19 + TypeScript + Tailwind CSS                │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP/SSE
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                      Backend Services                            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          FastAPI Auth Server (Port 8000)                   │  │
│  │  • JWT Authentication    • SQLAlchemy ORM                  │  │
│  │  • User Management       • Chat History Persistence        │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │        LangGraph Agent Server (Port 2024)                  │  │
│  │  • Agent Orchestration   • State Management                │  │
│  │  • Real-time Streaming   • Tool Integration                │  │
│  │                                                             │  │
│  │  Agents:                                                    │  │
│  │  ├─ Portfolio Strategist (Multi-source synthesis)          │  │
│  │  ├─ Deep Researcher (Iterative web research)               │  │
│  │  ├─ Chat Assistant (Conversational AI)                     │  │
│  │  ├─ Math Solver (Safe calculations)                        │  │
│  │  └─ MCP Agent (External tool integration)                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                    External Services                             │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Groq LLM API  │  │  SerpAPI       │  │  MCP Servers     │  │
│  │  (Inference)   │  │  (Web Search)  │  │  (Tools)         │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────────┐
│                    Persistence Layer                             │
│  ┌────────────────┐  ┌────────────────┐                         │
│  │  SQLite        │  │  Redis         │                         │
│  │  (Dev DB)      │  │  (Streaming)   │                         │
│  │                │  │                │                         │
│  │  PostgreSQL    │  │  (Optional)    │                         │
│  │  (Production)  │  │                │                         │
│  └────────────────┘  └────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.0.0 | UI framework with concurrent rendering |
| **TypeScript** | 5.7 | Type-safe JavaScript development |
| **Vite** | 6.4 | Fast build tool and dev server |
| **Tailwind CSS** | 4.1 | Utility-first CSS framework |
| **Framer Motion** | 12.x | Animation library for smooth UI transitions |
| **React Router** | 7.5 | Client-side routing |
| **Radix UI** | Latest | Accessible, unstyled component primitives |
| **Lucide React** | Latest | Icon library |
| **Recharts** | 2.15 | Data visualization for insights |

**Build Output:**
- Modern ES modules
- Code splitting by route
- Optimized asset bundling
- Tree-shaking for minimal bundle size

---

### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11+ | Primary runtime |
| **LangGraph** | 0.2+ | Agent orchestration framework |
| **LangChain** | 0.3+ | LLM abstraction and tool integration |
| **FastAPI** | Latest | REST API server for auth |
| **SQLAlchemy** | Latest | ORM for database operations |
| **Pydantic** | 2.x | Data validation and serialization |
| **UV** | Latest | Fast Python package manager |
| **Groq SDK** | Latest | LLM inference client |
| **JWT** | Latest | Token-based authentication |
| **Bcrypt** | Latest | Password hashing |

**Python Dependencies Management:**
- `pyproject.toml` — Package configuration
- `uv.lock` — Deterministic dependency resolution
- Virtual environment isolation

---

### Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Database** | SQLite (dev), PostgreSQL (prod) | Persistent storage |
| **Caching** | Redis | State streaming, pub/sub |
| **Containerization** | Docker | Application packaging |
| **Orchestration** | Docker Compose | Multi-container deployment |
| **Process Management** | Makefile | Development commands |

---

## Component Architecture

### Frontend Components

```
frontend/src/
├── components/
│   ├── auth/                    # Authentication
│   │   ├── LoginPage.tsx        # Login form + JWT handling
│   │   └── RegisterPage.tsx     # User registration
│   │
│   ├── landing/                 # Marketing site
│   │   ├── LandingPage.tsx      # Main composition
│   │   ├── Navigation.tsx       # Sticky header
│   │   ├── HeroSection.tsx      # Animated hero
│   │   ├── Features.tsx         # Feature grid
│   │   ├── SaiSection.tsx       # AI workflow viz
│   │   ├── Portfolio.tsx        # Dashboard preview
│   │   ├── Comparison.tsx       # Before/after table
│   │   ├── CTA.tsx              # Call to action
│   │   ├── Footer.tsx           # Footer links
│   │   └── AppMockup.tsx        # Floating app mockup
│   │
│   ├── insights/                # Data visualizations
│   │   ├── CompetitionHeatmap.tsx
│   │   ├── MarketGrowth.tsx
│   │   ├── OpportunityRadar.tsx
│   │   ├── PatentTimeline.tsx
│   │   └── Signals.tsx
│   │
│   ├── ui/                      # Reusable primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   └── ...
│   │
│   ├── ChatApp.tsx              # Main chat (no sidebar)
│   ├── ChatAppWithSidebar.tsx   # Chat + conversation history
│   ├── ChatMessagesView.tsx     # Message list renderer
│   ├── ChatSidebar.tsx          # Conversation management
│   ├── InputForm.tsx            # Message input + agent selector
│   ├── WelcomeScreen.tsx        # Empty state
│   ├── ActivityTimeline.tsx     # Real-time agent activity
│   └── ToolMessageDisplay.tsx   # Tool call visualization
│
├── lib/
│   ├── auth.ts                  # Auth service (login/register)
│   ├── chatService.ts           # LangGraph API client
│   ├── agents.ts                # Agent configuration
│   ├── models.ts                # Model definitions
│   └── utils.ts                 # Utility functions
│
├── types/
│   ├── agents.ts                # Agent type definitions
│   ├── messages.ts              # Message schemas
│   ├── models.ts                # Data models
│   └── tools.ts                 # Tool schemas
│
└── utils/
    └── animationConfig.ts       # Framer Motion presets
```

**Component Patterns:**
- **Compound Components** — Radix UI primitives composed together
- **Render Props** — Flexible component composition
- **Custom Hooks** — `useAuth`, `useChat`, `useAgentStream`
- **Context Providers** — Authentication state management

---

### Backend Architecture

```
backend/src/
├── agent/                       # AI Agent Implementations
│   ├── portfolio/               # Portfolio Strategist
│   │   ├── orchestrator.py      # Main graph orchestrator
│   │   ├── state.py             # State schema
│   │   ├── heuristics.py        # Decision heuristics
│   │   ├── prompts.py           # LLM prompts
│   │   └── config.py            # Agent configuration
│   │
│   ├── chatbot_graph.py         # Chat Assistant graph
│   ├── deep_researcher.py       # Deep Researcher graph
│   ├── math_agent.py            # Math Solver graph
│   ├── mcp_agent.py             # MCP Agent graph
│   ├── configuration.py         # Shared agent config
│   ├── prompts.py               # Shared prompts
│   ├── state.py                 # Shared state schemas
│   ├── tools_and_schemas.py     # Tool definitions
│   └── utils.py                 # Helper functions
│
├── auth/                        # Authentication System
│   ├── routes.py                # FastAPI endpoints
│   ├── chat_routes.py           # Chat history endpoints
│   ├── models.py                # SQLAlchemy models
│   ├── schemas.py               # Pydantic schemas
│   ├── database.py              # DB connection + session
│   └── utils.py                 # JWT + password hashing
│
├── config/
│   └── mcp_config.py            # MCP server configuration
│
├── connectors/                  # Data Source Connectors
│   ├── base.py                  # Base connector interface
│   ├── iqvia.py                 # IQVIA market data
│   ├── trials.py                # ClinicalTrials.gov
│   ├── patents.py               # Patent search
│   ├── exim.py                  # Import/export data
│   ├── internal.py              # Internal research
│   └── web.py                   # Web research
│
└── tools/                       # LangChain Tools
    ├── calculator.py            # Safe math evaluation
    └── mcp_loader.py            # MCP server loader
```

---

## Data Flow

### Authentication Flow

```
1. User Registration
   ┌──────────┐    POST /auth/register    ┌──────────┐
   │ Frontend │─────────────────────────>│  FastAPI │
   └──────────┘                           └─────┬────┘
                                                 │
                                          ┌──────▼──────┐
                                          │  Hash pwd   │
                                          │  Create user│
                                          └──────┬──────┘
                                                 │
                                          ┌──────▼──────┐
                                          │  SQLite DB  │
                                          │  Users      │
                                          └─────────────┘

2. User Login
   ┌──────────┐    POST /auth/login       ┌──────────┐
   │ Frontend │─────────────────────────>│  FastAPI │
   └──────────┘                           └─────┬────┘
                                                 │
                                          ┌──────▼──────┐
                                          │ Verify pwd  │
                                          │ Generate JWT│
                                          └──────┬──────┘
                                                 │
       ┌────────────────────────────────────────┘
       │ JWT Token (stored in localStorage)
       ▼
   ┌──────────┐
   │ Frontend │
   │  State   │
   └──────────┘
```

---

### Chat Message Flow

```
1. User sends message
   ┌──────────┐    Input message    ┌──────────────┐
   │   User   │──────────────────>  │ InputForm.tsx│
   └──────────┘                      └──────┬───────┘
                                            │
                                     ┌──────▼──────────┐
                                     │ chatService.ts  │
                                     │ createThread()  │
                                     └──────┬──────────┘
                                            │
                                     POST /threads
                                            │
                                     ┌──────▼──────────┐
                                     │  LangGraph API  │
                                     │  (Port 2024)    │
                                     └──────┬──────────┘
                                            │
                                     Create thread
                                     Return thread_id
                                            │
2. Submit message                           │
   ┌──────────────────────────────┐        │
   │ chatService.ts               │        │
   │ submitMessage(thread_id, msg)│<───────┘
   └──────┬───────────────────────┘
          │
   POST /threads/{id}/runs
          │
   ┌──────▼──────────┐
   │  LangGraph API  │
   │  Dispatch agent │
   └──────┬──────────┘
          │
   ┌──────▼──────────┐
   │  Agent Graph    │
   │  Execute steps  │
   └──────┬──────────┘
          │
3. Stream response
          │ SSE (Server-Sent Events)
          ▼
   ┌──────────────────┐
   │ ChatMessagesView │
   │ Render messages  │
   │ + ActivityTimeline│
   └──────────────────┘
```

**Key Features:**
- **Real-time Streaming** — Server-Sent Events (SSE) for live updates
- **Activity Timeline** — Shows agent thinking steps as they happen
- **Tool Visualization** — Displays tool calls and results
- **Error Recovery** — Graceful handling of network failures

---

### Agent Execution Flow

```
┌─────────────────────────────────────────────────────────────┐
│                   LangGraph Agent Graph                      │
│                                                               │
│  ┌────────┐      ┌────────┐      ┌────────┐      ┌────────┐│
│  │ Start  │─────>│Process │─────>│ Tool   │─────>│ Output ││
│  │ Node   │      │ Node   │      │ Node   │      │ Node   ││
│  └────────┘      └────────┘      └────────┘      └────────┘│
│       │               │               │               │      │
│       └───────────────┴───────────────┴───────────────┘      │
│                           │                                  │
│                    ┌──────▼──────┐                          │
│                    │    State    │                          │
│                    │  Management │                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

**State Management:**
- Each agent maintains typed state (Pydantic models)
- State persists across graph nodes
- Checkpointing for long-running operations
- Redis for distributed state (production)

---

## Infrastructure

### Development Setup

**3 Servers Required:**

1. **FastAPI Auth Server** (Port 8000)
   ```bash
   cd backend && uvicorn src.auth.routes:app --reload
   ```

2. **LangGraph Server** (Port 2024)
   ```bash
   cd backend && uv run langgraph dev --no-browser
   ```

3. **Vite Dev Server** (Port 5173)
   ```bash
   cd frontend && npm run dev
   ```

**Why 3 Servers?**
- **Separation of Concerns** — Auth vs Agent logic
- **Independent Scaling** — Scale agents separately
- **Development Velocity** — Hot reload on all layers

---

### Production Deployment (Docker)

```yaml
# docker-compose.yml
services:
  pramana-redis:
    image: redis:6
    healthcheck:
      test: redis-cli ping

  pramana-postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: pramana
      POSTGRES_USER: pramana
      POSTGRES_PASSWORD: pramana_secure_password

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

**Container Breakdown:**
- **pramana-api** — Frontend (static) + Backend APIs + LangGraph
- **pramana-redis** — State streaming and caching
- **pramana-postgres** — Persistent storage

---

## Project Structure

### Repository Layout

```
Pramana.ai/
├── backend/                     # Python backend
│   ├── src/
│   │   ├── agent/               # AI agents
│   │   ├── auth/                # Authentication
│   │   ├── config/              # Configuration
│   │   ├── connectors/          # Data connectors
│   │   └── tools/               # LangChain tools
│   ├── pramana.db               # SQLite database (dev)
│   ├── langgraph.json           # Agent registration
│   ├── pyproject.toml           # Python deps
│   └── .env.example             # Environment template
│
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── lib/                 # Services
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Utilities
│   ├── public/                  # Static assets
│   ├── package.json             # Node deps
│   ├── tsconfig.json            # TypeScript config
│   └── vite.config.ts           # Vite config
│
├── docs/                        # Documentation
│   ├── agents.md
│   ├── architecture.md          # This file
│   ├── api.md
│   ├── configuration.md
│   ├── deployment.md
│   ├── development.md
│   ├── frontend.md
│   ├── backend.md
│   └── troubleshooting.md
│
├── Dockerfile                   # Production build
├── docker-compose.yml           # Multi-container deployment
├── Makefile                     # Dev commands
├── README.md                    # Project overview
├── CONTRIBUTING.md              # Contribution guide
└── LICENSE                      # Apache 2.0
```

---

## Design Patterns

### Backend Patterns

#### 1. Graph-Based Agent Orchestration
**Pattern:** LangGraph state machines  
**Implementation:** Each agent is a directed graph with typed state

```python
from langgraph.graph import StateGraph

def create_agent_graph():
    graph = StateGraph(AgentState)
    graph.add_node("process", process_node)
    graph.add_node("tool", tool_node)
    graph.add_edge("process", "tool")
    return graph.compile()
```

**Benefits:**
- Visual debugging with LangGraph Studio
- Checkpoint/resume long-running operations
- Explicit control flow vs "black box" agents

---

#### 2. Connector Pattern
**Pattern:** Abstract base class for data sources  
**Implementation:** All connectors inherit from `BaseConnector`

```python
class BaseConnector:
    async def fetch(self, query: str) -> dict:
        raise NotImplementedError

class IQVIAConnector(BaseConnector):
    async def fetch(self, query: str) -> dict:
        # Implementation
        pass
```

**Benefits:**
- Easy to add new data sources
- Consistent error handling
- Mock data for development

---

#### 3. Repository Pattern
**Pattern:** SQLAlchemy ORM with repository layer  
**Implementation:** Database operations abstracted

```python
class UserRepository:
    def __init__(self, db: Session):
        self.db = db
    
    def create_user(self, email: str, password: str) -> User:
        user = User(email=email, hashed_password=hash_password(password))
        self.db.add(user)
        self.db.commit()
        return user
```

**Benefits:**
- Testable database logic
- Database-agnostic business logic
- Easy to swap SQLite → PostgreSQL

---

### Frontend Patterns

#### 1. Compound Components
**Pattern:** Radix UI composition  
**Implementation:** Flexible, accessible components

```tsx
<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>
    <DialogTitle>Title</DialogTitle>
    <DialogDescription>Description</DialogDescription>
  </DialogContent>
</Dialog>
```

---

#### 2. Custom Hooks
**Pattern:** Encapsulate stateful logic  
**Implementation:** Reusable React hooks

```tsx
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('token')
  );
  
  const login = async (email: string, password: string) => {
    const { access_token, user } = await authService.login(email, password);
    setToken(access_token);
    setUser(user);
    localStorage.setItem('token', access_token);
  };
  
  return { user, token, login, logout };
}
```

---

#### 3. Service Layer
**Pattern:** API client abstraction  
**Implementation:** Centralized API calls

```tsx
// lib/chatService.ts
export const chatService = {
  createThread: async () => {
    const response = await fetch(`${LANGGRAPH_API}/threads`, {
      method: 'POST'
    });
    return response.json();
  },
  
  submitMessage: async (threadId: string, message: string, agentId: string) => {
    // Implementation
  }
};
```

---

## Performance Considerations

### Frontend Optimization

1. **Code Splitting** — Route-based lazy loading
2. **Memoization** — `React.memo()`, `useMemo()`, `useCallback()`
3. **Virtual Scrolling** — For long message lists (future)
4. **Debounced Input** — Avoid excessive API calls
5. **Asset Optimization** — Image compression, lazy loading

### Backend Optimization

1. **Parallel Execution** — Portfolio Strategist runs 6 workers in parallel
2. **Streaming Responses** — SSE for real-time updates
3. **Connection Pooling** — Database connection reuse
4. **Caching** — Redis for state and API responses
5. **Async I/O** — FastAPI + asyncio for concurrent requests

---

## Security Architecture

### Authentication & Authorization

- **JWT Tokens** — Stateless authentication
- **Bcrypt Hashing** — Password security (cost factor: 12)
- **Token Expiration** — 7-day default (configurable)
- **Protected Routes** — FastAPI dependency injection
- **CORS Configuration** — Restricted origins in production

### API Security

- **Rate Limiting** — Per-endpoint limits (production)
- **Input Validation** — Pydantic schemas
- **SQL Injection Prevention** — SQLAlchemy ORM
- **XSS Protection** — React auto-escaping
- **Environment Variables** — Secrets in `.env`, never committed

---

## Related Documentation

- [Agents](agents.md) — AI agent implementation details
- [API Reference](api.md) — Endpoint documentation
- [Configuration](configuration.md) — Environment setup
- [Deployment](deployment.md) — Production deployment guide
- [Development](development.md) — Development workflow

---

**Questions?** Check the [Troubleshooting Guide](troubleshooting.md) or open an issue on GitHub.
