<h1 align="center">🧬 Pramana.ai</h1>

<p align="center">
  <strong>Master biomedical evidence. Without the silos.</strong>
</p>

<p align="center">
  <em>AI-powered biomedical research platform built with LangGraph, Groq, and React 19</em>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-what-makes-this-special">Features</a> •
  <a href="#-ai-agents">Agents</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="docs/deployment.md">Deployment</a> •
  <a href="docs">Documentation</a>
</p>

---

## ✨ What Makes This Special

**Pramana.ai unifies biomedical research workflows into a single AI-powered platform:**

- 🧬 **Purpose-Built for Biomedical Research** — Drug discovery, clinical trials, market intelligence
- 🤖 **5 Specialized AI Agents** — Portfolio Strategist, Deep Researcher, Chat Assistant, Math Solver, MCP Agent
- ⚡ **Lightning-Fast Inference** — Powered by Groq's LLaMA 3.3 70B models
- 🔌 **Extensible Tool Ecosystem** — Model Context Protocol (MCP) integration
- 📊 **Real-Time Streaming** — Watch AI agents think and work live
- 🧩 **Workflow Canvas** — Visualize multi-agent orchestration as a node graph.
  Run demo queries to animate each step (pending → processing → completed) and click nodes to inspect tasks and data sources.
- 🎨 **Beautiful Neo-Brutalist UI** — Modern React 19 + Framer Motion design
- 🔐 **Production-Ready Auth** — JWT authentication, SQLite/PostgreSQL persistence

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ & **npm**
- **Python** 3.11+ & **UV** package manager
- **API Keys:** [Groq](https://console.groq.com/keys) (required), [SerpAPI](https://serpapi.com/) (for Deep Researcher)

### Installation

```bash
# Clone and enter directory
git clone https://github.com/darved2305/ggw_eytechathon.git
cd ggw_eytechathon

# Configure environment
cd backend
cp .env.example .env
# Edit .env with your GROQ_API_KEY and SERPAPI_API_KEY

# Install dependencies
uv sync                                    # Backend
cd ../frontend && npm install              # Frontend

# Start all servers
cd .. && make dev
```

**Access the app:**
- Landing Page: http://localhost:5173
- Main App: http://localhost:5173/app
- Workflow Canvas: http://localhost:5173/workflow
- Chat Interface (legacy): http://localhost:5173/chat
- LangGraph API: http://localhost:2024/docs

> 💡 **New to the project?** Check out the [Development Guide](docs/development.md) for detailed setup instructions.

---

## 🤖 AI Agents

Pramana.ai includes five specialized AI agents, each optimized for different research workflows:

### 💼 Portfolio Strategist
**AI-powered pharmaceutical innovation discovery and opportunity scoring**

Analyzes drug opportunities through 6 parallel data sources (IQVIA, Trials, Patents, EXIM, Internal, Web), applies 7 decision heuristics, and generates evidence-backed opportunity scores.

**Key Signals:**
- `HIGH_WHITESPACE` — Strong unmet need with few active trials
- `PATENT_WINDOW_OPEN` — Key patents expiring soon
- `FRAGMENTED_MARKET` — Low concentration, entry opportunity

> 📖 [View detailed agent documentation](docs/agents.md#portfolio-strategist)

### 🔍 Deep Researcher
**Advanced web research with iterative query refinement**

Generates optimized search queries, performs parallel web research via SerpAPI, reflects on findings, and produces citation-first reports.

**Configuration:** Supports custom search query counts, max loops, and model selection.

> 📖 [View detailed agent documentation](docs/agents.md#deep-researcher)

### 💬 Chat Assistant
**General-purpose conversational AI with context awareness**

Natural language conversations powered by Groq's fast inference. Best for quick Q&A and general assistance.

### 🧮 Math Solver
**Safe mathematical expression evaluation**

Supports arithmetic operations, mathematical functions (sqrt, sin, cos, log, exp), and constants (pi, e).

### 🔧 MCP Agent
**Model Context Protocol integration for external tools**

Connects to MCP servers (Filesystem, Brave Search) for extensible tool capabilities.

> 📖 [Full agent documentation →](docs/agents.md)

---

## 🏗️ Architecture

### Tech Stack

**Frontend:** React 19, TypeScript, Tailwind CSS v4, Framer Motion, Vite  
**Backend:** Python 3.11+, LangGraph, LangChain, Groq, FastAPI  
**Infrastructure:** Redis (streaming), PostgreSQL (persistence), Docker

```
┌─────────────────────────────────────────────────────────┐
│                    React 19 Frontend                     │
│        (Neo-brutalist UI + Real-time Streaming)          │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/SSE
┌──────────────────────┴──────────────────────────────────┐
│               LangGraph Backend (Port 2024)              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │Portfolio │  │  Deep    │  │   Chat   │  │   MCP   │ │
│  │Strategist│  │Researcher│  │ Assistant│  │  Agent  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│              FastAPI Auth Server (Port 8000)             │
│         JWT Authentication + SQLAlchemy ORM              │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────┐
│     Redis (Streaming)     │    PostgreSQL (State)       │
└───────────────────────────┴─────────────────────────────┘
```

> 📖 [Detailed architecture documentation →](docs/architecture.md)

---

## 🚢 Deployment

### Development (2 servers + optional Auth API)

```bash
# Option 1: Use Makefile (recommended)
make dev

# Option 2: Manual startup
cd backend && uv run langgraph dev --no-browser        # Terminal 1 (port 2024)
cd frontend && npm run dev                             # Terminal 2 (port 5173)

# Optional: Auth API (needed for /login, /register, and persisted chat history)
cd backend && uv run uvicorn src.auth.app:app --reload --port 8000

# If uvicorn isn't available in your env:
#   cd backend && uv add uvicorn
```

### Docker (Production)

```bash
docker build -t pramana-ai -f Dockerfile .
GROQ_API_KEY=xxx SERPAPI_API_KEY=xxx docker-compose up
```

> 📖 [Full deployment guide →](docs/deployment.md) | [Configuration reference →](docs/configuration.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Agents](docs/agents.md) | Detailed agent behavior, heuristics, and configuration |
| [Architecture](docs/architecture.md) | Full stack, infrastructure, and LangGraph internals |
| [API Reference](docs/api.md) | LangGraph endpoints and backend API routes |
| [Configuration](docs/configuration.md) | Environment variables, models, and MCP servers |
| [Deployment](docs/deployment.md) | Production checklist, Docker, and scaling |
| [Development](docs/development.md) | Testing, linting, and contribution workflow |
| [Frontend](docs/frontend.md) | UI components, landing page, and design system |
| [Backend](docs/backend.md) | Authentication, database schema, and persistence |
| [Troubleshooting](docs/troubleshooting.md) | Common errors and fixes |

---

## 🤝 Contributing

We welcome contributions! Please read our [Development Guide](docs/development.md) for setup instructions and coding standards.

**Quick contribution workflow:**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push and open a Pull Request

**Ideas for contributions:** New agents, data connectors, UI improvements, documentation, tests

---

## 📄 License

This project is licensed under the **Apache License 2.0**. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ by team GitGonewild**

[Groq](https://groq.com/) • [LangChain](https://www.langchain.com/) • [Model Context Protocol](https://modelcontextprotocol.io/)

⭐ Star us on GitHub if you find this useful! ⭐

</div>
