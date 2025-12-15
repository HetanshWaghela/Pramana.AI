<h1 align="center">🧬 Pramana.ai</h1>

<p align="center">
  <strong>Master biomedical evidence. Without the silos.</strong>
</p>

<p align="center">
  <em>An AI-powered biomedical research platform built with LangGraph, Groq, and React 19</em>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-features">Features</a> •
  <a href="#-ai-agents">AI Agents</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-deployment">Deployment</a>
</p>

---

## ✨ What Makes Pramana.ai Special

| Feature | Description |
|---------|-------------|
| 🧬 **Biomedical Focus** | Purpose-built for drug discovery and clinical research workflows |
| 🤖 **5 Specialized Agents** | Portfolio Strategist, Deep Researcher, Chatbot, Math Solver, MCP Agent |
| ⚡ **Groq-Powered** | Lightning-fast inference with LLaMA 3.3 70B models |
| 🔌 **MCP Integration** | Model Context Protocol for extensible tool ecosystem |
| 🎨 **Beautiful UI** | Neo-brutalist landing page with Framer Motion animations |
| 📊 **Real-time Streaming** | Watch AI think and work in real-time with activity timeline |
| 🏗️ **Production-Ready** | Docker deployment with Redis & PostgreSQL |

---

## 🚀 Quick Start

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| Node.js | 18+ | Frontend development |
| Python | 3.11+ | Backend runtime |
| UV | Latest | Python package manager |
| npm | Latest | Node package manager |

### API Keys Required

| Service | Get Key | Purpose |
|---------|---------|---------|
| **Groq** | [console.groq.com](https://console.groq.com/keys) | LLM inference (required) |
| **SerpAPI** | [serpapi.com](https://serpapi.com/) | Web search (required for Deep Researcher) |
| **Brave Search** | [brave.com/search/api](https://brave.com/search/api/) | Alternative search (optional) |
| **LangSmith** | [smith.langchain.com](https://smith.langchain.com/) | Monitoring (optional) |

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/N1KH1LT0X1N/Pharma-Agent.git
cd Pharma-Agent

# 2. Configure environment
cd backend
cp .env.example .env
# Edit .env with your API keys

# 3. Install backend dependencies
uv sync

# 4. Install frontend dependencies
cd ../frontend
npm install

# 5. Install MCP servers (globally)
npm install -g @modelcontextprotocol/server-filesystem @modelcontextprotocol/server-brave-search

# 6. Start development servers
cd ..
make dev
```

### Access the Application

| URL | Description |
|-----|-------------|
| `http://localhost:5173/` | 🎨 Landing Page |
| `http://localhost:5173/chat` | 💬 Chat Application (with sidebar) |
| `http://localhost:5173/login` | 🔐 Login Page |
| `http://localhost:5173/register` | 📝 Register Page |
| `http://localhost:2024` | 🔧 LangGraph API |
| `http://localhost:2024/docs` | 📚 API Documentation |

---

## 🤖 AI Agents

### 💼 Portfolio Strategist (Default)
**AI-powered pharmaceutical innovation discovery with multi-source evidence synthesis**

- Clarifies scope: molecule, therapy area, region, population
- Dispatches 6 parallel workers: IQVIA, Trials, Patents, EXIM, Internal, Web
- Applies 7 decision heuristics to score opportunities
- Generates compelling innovation stories with evidence-backed recommendations

```mermaid
flowchart LR
    A[User Query] --> B[Clarify Scope]
    B --> C[Dispatch Workers]
    C --> D1[IQVIA] & D2[Trials] & D3[Patents] & D4[EXIM] & D5[Internal] & D6[Web]
    D1 & D2 & D3 & D4 & D5 & D6 --> E[Synthesize Evidence]
    E --> F[Generate Story]
    F --> G[Portfolio Report]
```

**Heuristic Signals:**
- `HIGH_WHITESPACE` - Strong unmet need with few active trials
- `PATENT_WINDOW_OPEN` - Key patents expiring soon
- `FRAGMENTED_MARKET` - Low concentration, entry opportunity
- `LOCAL_MFG_OPPORTUNITY` - Reduce import dependency
- `FTO_WARNING` - Freedom to operate concerns

**Demo Scenarios:**
| Scenario | Opportunity Score | Key Signals |
|----------|------------------|-------------|
| Metformin Anti-Aging (US) | 87/100 | HIGH_WHITESPACE, PATENT_WINDOW_OPEN |
| COPD Respiratory (India) | 85/100 | HIGH_WHITESPACE, FRAGMENTED_MARKET |

> **Note:** Uses mock data connectors for demonstration. Replace with real APIs in production.

---

### 🔍 Deep Researcher
**Advanced web research with iterative refinement**

- Generates optimized search queries using Groq LLMs
- Performs parallel web research via SerpAPI
- Reflects on gathered information to identify knowledge gaps
- Produces citation-first research reports

```mermaid
flowchart LR
    A[User Query] --> B[Generate Queries]
    B --> C[Web Research]
    C --> D[Reflection]
    D -->|Needs More| C
    D -->|Sufficient| E[Finalize Answer]
```

**Configuration Options:**
| Parameter | Default | Description |
|-----------|---------|-------------|
| `initial_search_query_count` | 3 | Number of initial queries |
| `max_research_loops` | 2 | Maximum refinement iterations |
| `reasoning_model` | llama-3.3-70b-versatile | Model for analysis |

---

### 💬 Chat Assistant
**General-purpose conversational AI**

- Natural, context-aware conversations
- Maintains conversation history (last 10 messages)
- Friendly and helpful responses
- Powered by Groq's fast inference

**Best For:**
- Quick questions and answers
- General assistance
- Casual conversation

---

### 🧮 Math Solver
**Advanced mathematical calculations and problem-solving**

- Safe expression evaluation with sandboxed `eval()`
- Supports basic arithmetic: `+`, `-`, `*`, `/`, `**`
- Mathematical functions: `sqrt`, `sin`, `cos`, `tan`, `log`, `exp`
- Constants: `pi`, `e`

**Example Calculations:**
```python
"2 + 3 * 4"          # → 14
"sqrt(16)"           # → 4.0
"sin(pi/2)"          # → 1.0
"log(e)"             # → 1.0
"factorial(5)"       # → 120
```

---

### 🔧 MCP Agent
**Model Context Protocol integration for external tools**

- Connects to MCP servers (Filesystem, Brave Search)
- Extensible tool ecosystem
- Dynamic tool loading at runtime
- Parallel server initialization

**Supported MCP Servers:**

| Server | Capabilities |
|--------|-------------|
| **Filesystem** | Read/write files, directory operations, sandboxed access |
| **Brave Search** | Web search, result processing, citation tracking |

---

## 🏗️ Architecture

![Architecture Overview](./architecture.png)

### Technology Stack

#### Frontend (`/frontend`)
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.0.0 | UI framework |
| TypeScript | 5.7 | Type safety |
| Tailwind CSS | 4.1 | Styling |
| Framer Motion | 12.x | Animations |
| Vite | 6.4 | Build tool |
| React Router | 7.5 | Navigation |
| Radix UI | Latest | Accessible components |

#### Backend (`/backend`)
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Runtime |
| LangGraph | 0.2+ | Agent orchestration |
| LangChain | 0.3+ | LLM framework |
| Groq | Latest | LLM provider |
| FastAPI | Latest | HTTP endpoints & Authentication |
| SQLAlchemy | Latest | ORM for database |
| SQLite | Latest | Database (default) |
| JWT | Latest | Token-based authentication |
| Bcrypt | Latest | Password hashing |
| UV | Latest | Package manager |

#### Infrastructure
| Technology | Purpose |
|------------|---------|
| Redis | Pub/sub streaming, state caching |
| PostgreSQL | State persistence, task queuing |
| Docker | Containerization |

### Project Structure

```
Pharma-Agent/
├── 📁 backend/                  # Python backend
│   ├── 📁 src/
│   │   ├── 📁 agent/           # AI agent implementations
│   │   │   ├── chatbot_graph.py
│   │   │   ├── deep_researcher.py
│   │   │   ├── math_agent.py
│   │   │   ├── mcp_agent.py
│   │   │   ├── configuration.py
│   │   │   ├── prompts.py
│   │   │   └── state.py
│   │   ├── 📁 auth/            # Authentication & Database
│   │   │   ├── routes.py       # Login/Register endpoints
│   │   │   ├── models.py       # SQLAlchemy models
│   │   │   ├── schemas.py      # Pydantic schemas
│   │   │   ├── database.py     # Database connection
│   │   │   ├── utils.py        # JWT & password hashing
│   │   │   └── chat_routes.py  # Chat history endpoints
│   │   ├── 📁 config/          # Configuration
│   │   │   └── mcp_config.py
│   │   └── 📁 tools/           # LangChain tools
│   │       ├── calculator.py
│   │       └── mcp_loader.py
│   ├── pramana.db              # SQLite database
│   ├── langgraph.json          # LangGraph configuration
│   ├── pyproject.toml          # Python dependencies
│   └── .env.example            # Environment template
│
├── 📁 frontend/                 # React frontend
│   ├── 📁 src/
│   │   ├── 📁 components/
│   │   │   ├── 📁 auth/        # Authentication pages
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── RegisterPage.tsx
│   │   │   ├── 📁 landing/     # Landing page (11 components)
│   │   │   │   ├── Navigation.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── Features.tsx
│   │   │   │   ├── SaiSection.tsx
│   │   │   │   ├── Portfolio.tsx
│   │   │   │   ├── Comparison.tsx
│   │   │   │   ├── CTA.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── AppMockup.tsx
│   │   │   │   └── LandingPage.tsx
│   │   │   ├── 📁 ui/          # Reusable UI components
│   │   │   ├── ChatApp.tsx     # Main chat application
│   │   │   ├── ChatAppWithSidebar.tsx
│   │   │   ├── ChatMessagesView.tsx
│   │   │   ├── ChatSidebar.tsx
│   │   │   ├── InputForm.tsx
│   │   │   ├── WelcomeScreen.tsx
│   │   │   └── ActivityTimeline.tsx
│   │   ├── 📁 types/           # TypeScript types
│   │   │   ├── agents.ts
│   │   │   └── models.ts
│   │   ├── 📁 lib/             # API services & utilities
│   │   │   ├── auth.ts         # Authentication service
│   │   │   ├── chatService.ts  # Chat API calls
│   │   │   └── utils.ts
│   │   ├── 📁 utils/           # Animation configs
│   │   ├── App.tsx             # Routing hub
│   │   ├── main.tsx            # Entry point
│   │   └── global.css          # Global styles
│   ├── package.json
│   └── vite.config.ts
│
├── Dockerfile                   # Production build
├── docker-compose.yml          # Full stack deployment
├── Makefile                    # Dev commands
└── README.md                   # This file
```

---

## 🔐 Authentication & Database

### User Authentication
The platform includes a complete authentication system with:

- **JWT Token-based authentication** - Secure token generation and validation
- **Password hashing with Bcrypt** - Industry-standard password security
- **User registration and login** - Full user account management
- **Protected routes** - Authorization middleware for secure endpoints

### Database Schema

#### Users Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| email | String | Unique email address |
| hashed_password | String | Bcrypt hashed password |
| created_at | DateTime | Account creation timestamp |

#### Chats Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| user_id | Integer | Foreign key to Users |
| title | String | Chat conversation title |
| agent | String | Agent used (deep_researcher, chatbot, etc) |
| created_at | DateTime | Chat creation timestamp |

#### Messages Table
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Primary key |
| chat_id | Integer | Foreign key to Chats |
| role | String | 'user' or 'assistant' |
| content | Text | Message content |
| timestamp | DateTime | Message timestamp |

### API Endpoints

#### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Register new user account |
| `/auth/login` | POST | Login and receive JWT token |

#### Chat History
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/chats/` | GET | Get all user chats (requires auth) |
| `/chats/` | POST | Create new chat (requires auth) |
| `/chats/{id}` | GET | Get specific chat with messages |
| `/chats/{id}` | DELETE | Delete chat |

---

## ⚙️ Configuration

### Environment Variables

Create `backend/.env` with:

```bash
# ═══════════════════════════════════════════════════════════
# REQUIRED - AI Provider
# ═══════════════════════════════════════════════════════════
GROQ_API_KEY=your_groq_api_key_here

# ═══════════════════════════════════════════════════════════
# REQUIRED - Web Search (for Deep Researcher)
# ═══════════════════════════════════════════════════════════
SERPAPI_API_KEY=your_serpapi_api_key_here

# ═══════════════════════════════════════════════════════════
# OPTIONAL - Monitoring
# ═══════════════════════════════════════════════════════════
LANGSMITH_API_KEY=your_langsmith_api_key_here

# ═══════════════════════════════════════════════════════════
# OPTIONAL - Production Database
# ═══════════════════════════════════════════════════════════
REDIS_URI=redis://localhost:6379
POSTGRES_URI=postgres://user:pass@localhost:5432/db

# ═══════════════════════════════════════════════════════════
# OPTIONAL - MCP Servers
# ═══════════════════════════════════════════════════════════
MCP_FILESYSTEM_ENABLED=true
MCP_FILESYSTEM_PATH=/app/workspace
MCP_BRAVE_SEARCH_ENABLED=true
BRAVE_API_KEY=your_brave_api_key_here
```

### Available Models

| Model ID | Name | Best For |
|----------|------|----------|
| `llama-3.3-70b-versatile` | LLaMA 3.3 70B | Complex reasoning, research |
| `llama-3.1-70b-versatile` | LLaMA 3.1 70B | Balanced performance |
| `llama-3.1-8b-instant` | LLaMA 3.1 8B | Fast, simple tasks |

---

## 🚢 Deployment

### Development Mode

```bash
# Option 1: Using Makefile
make dev

# Option 2: Separate terminals
# Terminal 1 - Backend API
cd backend && uvicorn src.auth.routes:app --reload

# Terminal 2 - LangGraph Server
cd backend && uv run langgraph dev --no-browser

# Terminal 3 - Frontend
cd frontend && npm run dev
```

### Quick Start Guide

1. **Install dependencies:**
   ```bash
   cd backend && pip install -e .
   cd ../frontend && npm install
   ```

2. **Configure environment:**
   - Create `backend/.env` with required API keys (see Configuration section)

3. **Start all servers:**
   - Backend API: `uvicorn src.auth.routes:app --reload` (port 8000)
   - LangGraph: `uv run langgraph dev --no-browser` (port 2024)
   - Frontend: `npm run dev` (port 5173)

4. **Create account:**
   - Navigate to http://localhost:5173
   - Click "Register" and create your account
   - Login with your credentials

5. **Start chatting:**
   - Select an AI agent (Deep Researcher, Chatbot, Math Agent, MCP Agent)
   - Ask questions and explore!

### Docker Deployment

```bash
# 1. Build the image
docker build -t pramana-ai -f Dockerfile .

# 2. Run with Docker Compose
GROQ_API_KEY=xxx SERPAPI_API_KEY=xxx docker-compose up

# Access at http://localhost:8123/
```

### Production Checklist

- [ ] **Environment Variables** - Secure API key management
- [ ] **Database** - Migrate from SQLite to PostgreSQL for production
- [ ] **Redis** - Configure for state streaming
- [ ] **HTTPS** - Enable secure communications
- [ ] **JWT Secret** - Use strong secret key for token signing
- [ ] **CORS** - Configure allowed origins
- [ ] **LangSmith** - Connect for observability
- [ ] **Rate Limiting** - Protect API endpoints
- [ ] **Backups** - Database backup strategy

### Troubleshooting

#### Login Issues
- Ensure backend server is running on port 8000
- Check database exists: `backend/pramana.db`
- Verify credentials are correct (case-sensitive)

#### Database Issues
- Database is created automatically on first run
- Location: `backend/pramana.db`
- To reset: delete file and restart backend

#### Port Conflicts
- Backend API: 8000
- LangGraph: 2024
- Frontend: 5173
- Kill processes: `netstat -ano | findstr :<PORT>` then `taskkill /PID <PID> /F`

---

## 🎨 Landing Page

The landing page features a **neo-brutalist design** with:

| Section | Description |
|---------|-------------|
| **Navigation** | Sticky header with smooth scrolling |
| **Hero** | Animated headline with floating app mockups |
| **Features** | Three colorful feature cards |
| **SaiSection** | AI workflow visualization |
| **Portfolio** | Research dashboard preview |
| **Comparison** | Manual vs Pramana.ai table |
| **CTA** | Call-to-action with demo button |
| **Footer** | Links and branding |

### Design System

```css
/* Neo-brutalist utilities */
.shadow-brutal { box-shadow: 8px 8px 0px 0px rgba(0,0,0,1); }
.border-3 { border-width: 3px; }

/* Brand colors */
.bg-brand-yellow { background-color: #FDE047; }
.bg-brand-pink { background-color: #F9A8D4; }
.bg-brand-green { background-color: #4ADE80; }

/* Theme transition: Landing (light) → Chatbot (dark) */
```

---

## 📡 API Reference

### LangGraph Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/threads` | POST | Create new conversation thread |
| `/threads/{id}/runs` | POST | Submit message to agent |
| `/threads/{id}/runs/{run_id}/stream` | GET | Stream agent responses |
| `/assistants` | GET | List available agents |

### Available Agents (Assistant IDs)

| ID | Agent |
|----|-------|
| `deep_researcher` | Deep Researcher |
| `chatbot` | Chat Assistant |
| `math_agent` | Math Solver |
| `mcp_agent` | MCP Agent |

---

## 🧪 Development

### Testing

```bash
cd backend

# Run all tests
make test

# Watch mode
make test_watch

# Coverage
uv run pytest --cov=src
```

### Linting & Formatting

```bash
cd backend

# Lint code
make lint

# Auto-format
make format

# Type checking
uv run mypy --strict src/
```

### Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Build production
npm run build

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Ideas

- 🤖 **New Agents** - Add specialized research agents
- 🔧 **New Tools** - Create LangChain tools for data sources
- 🎨 **UI Improvements** - Enhance the user interface
- 📚 **Documentation** - Improve docs and examples
- 🧪 **Testing** - Add test coverage

---

## 📚 Resources

| Resource | Link |
|----------|------|
| LangGraph Docs | [langchain-ai.github.io/langgraph](https://langchain-ai.github.io/langgraph/) |
| Model Context Protocol | [modelcontextprotocol.io](https://modelcontextprotocol.io/) |
| Groq Cloud | [console.groq.com](https://console.groq.com/) |
| LangChain Tools | [python.langchain.com/docs/integrations/tools](https://python.langchain.com/docs/integrations/tools/) |
| React 19 | [react.dev](https://react.dev/) |
| Tailwind CSS v4 | [tailwindcss.com](https://tailwindcss.com/) |
| Framer Motion | [framer.com/motion](https://www.framer.com/motion/) |

---

## 💖 Acknowledgments

- **Groq** - Lightning-fast AI inference
- **LangChain Team** - Amazing LangGraph framework
- **Anthropic** - Model Context Protocol innovation
- **Ylang Labs** - Original template inspiration
- **GitGonewild Team** - Development and design

---

## 📄 License

This project is licensed under the **Apache License 2.0**. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ by team GitGonewild**

⭐ Star us on GitHub if you find this useful! ⭐

</div>
