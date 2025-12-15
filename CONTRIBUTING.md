# Contributing to Pramana.ai

Thank you for your interest in contributing to Pramana.ai! We welcome contributions from the community.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- UV (Python package manager)
- Git

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Pharma-Agent.git
   cd Pharma-Agent
   ```

2. **Install dependencies**
   ```bash
   make install
   ```

3. **Configure environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development servers**
   ```bash
   make dev
   ```

## 📝 Development Workflow

### Branch Naming

Use descriptive branch names:
- `feature/add-new-agent` - New features
- `fix/calculation-error` - Bug fixes
- `docs/update-readme` - Documentation
- `refactor/improve-prompts` - Code refactoring

### Commit Messages

Follow conventional commit format:
```
type(scope): description

[optional body]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(agent): add clinical trials search agent
fix(math): correct division by zero handling
docs(readme): update installation instructions
```

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Run tests and linting
4. Submit a pull request
5. Wait for review and address feedback

## 🧪 Testing

### Backend Tests
```bash
cd backend
make test
```

### Frontend Type Check
```bash
cd frontend
npm run typecheck
```

### Linting
```bash
# Backend
cd backend
make lint

# Frontend
cd frontend
npm run lint
```

## 📁 Project Structure

```
Pharma-Agent/
├── backend/              # Python backend
│   ├── src/agent/       # AI agents
│   ├── src/config/      # Configuration
│   └── src/tools/       # LangChain tools
└── frontend/            # React frontend
    ├── src/components/  # React components
    ├── src/types/       # TypeScript types
    └── src/lib/         # Utilities
```

## 🎯 Contribution Ideas

### High Impact
- [ ] Add new specialized research agents
- [ ] Implement additional MCP servers
- [ ] Add support for more LLM providers
- [ ] Create biomedical-specific tools

### Good First Issues
- [ ] Improve documentation
- [ ] Add unit tests
- [ ] Fix UI/UX issues
- [ ] Update dependencies

### Documentation
- [ ] API documentation
- [ ] Agent customization guide
- [ ] Deployment tutorials

## 🧬 Adding a New Agent

1. Create agent file in `backend/src/agent/`
2. Define state and configuration
3. Implement graph nodes
4. Register in `langgraph.json`
5. Add to frontend agent types
6. Update documentation

Example structure:
```python
# backend/src/agent/my_agent.py
from langgraph.graph import StateGraph, START, END
from agent.configuration import MyAgentConfiguration
from agent.state import MyAgentState

def my_node(state: MyAgentState, config):
    # Implementation
    pass

builder = StateGraph(MyAgentState, config_schema=MyAgentConfiguration)
builder.add_node("my_node", my_node)
builder.add_edge(START, "my_node")
builder.add_edge("my_node", END)

my_agent_graph = builder.compile(name="my-agent")
```

## 🔧 Adding a New Tool

1. Create tool file in `backend/src/tools/`
2. Use `@tool` decorator from LangChain
3. Import in relevant agent
4. Test thoroughly

Example:
```python
from langchain_core.tools import tool

@tool
def my_tool(input: str) -> str:
    """Tool description for the LLM."""
    # Implementation
    return result
```

## 📜 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

## 📄 License

By contributing, you agree that your contributions will be licensed under the Apache License 2.0.

---

**Questions?** Open an issue or reach out to the maintainers.

Built with ❤️ by team GitGonewild
