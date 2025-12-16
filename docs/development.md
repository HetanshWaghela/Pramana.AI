# Development Guide

Complete guide for contributing to Pramana.ai, including development workflow, testing, linting, and best practices.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Style & Standards](#code-style--standards)
- [Testing](#testing)
- [Debugging](#debugging)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)

---

## Getting Started

### Prerequisites

| Requirement | Version | Purpose |
|-------------|---------|---------|
| **Node.js** | 18+ | Frontend development |
| **Python** | 3.11+ | Backend runtime |
| **UV** | Latest | Python package manager |
| **npm** | Latest | Node package manager |
| **Git** | Latest | Version control |

### Installation

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/Pharma-Agent.git
cd Pharma-Agent

# 2. Install backend dependencies
cd backend
uv sync

# 3. Install frontend dependencies
cd ../frontend
npm install

# 4. Configure environment
cd ../backend
cp .env.example .env
# Edit .env with your API keys (GROQ_API_KEY, SERPAPI_API_KEY)

# 5. Start development servers
cd ..
make dev
```

---

## Development Workflow

### Branch Strategy

Follow Git Flow branching model:

```
main (production)
  └─ develop (integration)
       ├─ feature/add-new-agent
       ├─ feature/improve-ui
       ├─ fix/calculation-error
       └─ docs/update-readme
```

**Branch Naming Convention:**

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/description` | `feature/add-clinical-trials-agent` |
| Bug Fix | `fix/description` | `fix/math-division-by-zero` |
| Documentation | `docs/description` | `docs/update-api-reference` |
| Refactor | `refactor/description` | `refactor/improve-prompts` |
| Chore | `chore/description` | `chore/update-dependencies` |

---

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(agent): add clinical trials search agent

Implements parallel search across ClinicalTrials.gov API with
filtering by phase, status, and location.

Closes #42

fix(math): correct division by zero handling

Added check for zero denominator before division.

docs(readme): update installation instructions

Updated to reflect new UV package manager usage.
```

---

### Development Commands

#### Backend

```bash
cd backend

# Start LangGraph server
uv run langgraph dev --no-browser

# Start FastAPI auth server
uvicorn src.auth.routes:app --reload

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=src

# Lint code
uv run ruff check src/

# Auto-fix linting issues
uv run ruff check src/ --fix

# Format code
uv run ruff format src/

# Type checking
uv run mypy src/
```

#### Frontend

```bash
cd frontend

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format
```

---

## Code Style & Standards

### Python (Backend)

#### Style Guide

Follow [PEP 8](https://pep8.org/) with these configurations:

```toml
# backend/pyproject.toml
[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = [
    "E",   # pycodestyle errors
    "W",   # pycodestyle warnings
    "F",   # pyflakes
    "I",   # isort
    "N",   # pep8-naming
    "UP",  # pyupgrade
]
ignore = [
    "E501",  # line too long (handled by formatter)
]

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
```

#### Best Practices

**1. Type Hints:**
```python
# Good ✓
def fetch_data(query: str, limit: int = 10) -> list[dict[str, Any]]:
    """Fetch data with query."""
    return []

# Bad ✗
def fetch_data(query, limit=10):
    return []
```

**2. Docstrings:**
```python
def apply_heuristic(market_data: dict, trials: list) -> tuple[float, list[str]]:
    """Apply decision heuristic to evaluate opportunity.
    
    Args:
        market_data: IQVIA market intelligence data
        trials: List of clinical trials
        
    Returns:
        Tuple of (opportunity_score, signals_list)
        
    Example:
        >>> score, signals = apply_heuristic({"cagr": 0.08}, [])
        >>> assert score > 0
    """
    pass
```

**3. Error Handling:**
```python
# Good ✓
try:
    result = fetch_api(query)
except HTTPError as e:
    logger.error(f"API request failed: {e}")
    raise
except Exception as e:
    logger.exception("Unexpected error")
    raise

# Bad ✗
try:
    result = fetch_api(query)
except:
    pass
```

---

### TypeScript (Frontend)

#### Style Guide

```json
// frontend/tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### Best Practices

**1. Type Safety:**
```typescript
// Good ✓
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const message: Message = {
  id: '1',
  role: 'user',
  content: 'Hello',
  timestamp: new Date()
};

// Bad ✗
const message = {
  id: '1',
  role: 'user',
  content: 'Hello'
};
```

**2. Component Structure:**
```typescript
// Good ✓
interface ChatMessageProps {
  message: Message;
  onReply?: (content: string) => void;
}

export function ChatMessage({ message, onReply }: ChatMessageProps) {
  return <div>{message.content}</div>;
}

// Bad ✗
export function ChatMessage(props: any) {
  return <div>{props.message.content}</div>;
}
```

**3. Custom Hooks:**
```typescript
// Good ✓
function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load user
  }, []);
  
  return { user, loading };
}

// Usage
const { user, loading } = useAuth();
```

---

## Testing

### Backend Testing

#### Test Structure

```
backend/
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Shared fixtures
│   ├── test_agents.py       # Agent tests
│   ├── test_auth.py         # Authentication tests
│   ├── test_heuristics.py   # Decision heuristic tests
│   └── test_tools.py        # Tool tests
```

#### Running Tests

```bash
cd backend

# Run all tests
uv run pytest

# Run specific test file
uv run pytest tests/test_agents.py

# Run specific test
uv run pytest tests/test_agents.py::test_portfolio_strategist

# Run with coverage
uv run pytest --cov=src --cov-report=html

# Watch mode (re-run on file changes)
uv run pytest-watch

# Verbose output
uv run pytest -v
```

#### Writing Tests

**Example: Agent Test**
```python
# tests/test_agents.py
import pytest
from src.agent.deep_researcher import deep_researcher_graph

@pytest.mark.asyncio
async def test_deep_researcher_query():
    """Test Deep Researcher generates valid queries."""
    state = {"messages": [{"role": "user", "content": "CRISPR safety"}]}
    result = await deep_researcher_graph.ainvoke(state)
    
    assert "messages" in result
    assert len(result["messages"]) > 1
    assert "CRISPR" in result["messages"][-1]["content"]

@pytest.mark.asyncio
async def test_portfolio_heuristics():
    """Test Portfolio Strategist heuristics."""
    from src.agent.portfolio.heuristics import apply_all_heuristics
    
    market_data = [{"data": {"market_data": {"unmet_need_score": 0.8}}}]
    trials_data = [{"studies": []}]
    patent_data = []
    exim_data = []
    
    scores, signals = apply_all_heuristics(
        market_data, trials_data, patent_data, exim_data
    )
    
    assert "HIGH_WHITESPACE" in signals
    assert scores["opportunity"] > 50
```

**Example: API Test**
```python
# tests/test_auth.py
from fastapi.testclient import TestClient
from src.auth.routes import app

client = TestClient(app)

def test_register_user():
    """Test user registration."""
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "password": "secure_password_123"
    })
    assert response.status_code == 201
    assert "id" in response.json()

def test_login_user():
    """Test user login."""
    # First register
    client.post("/auth/register", json={
        "email": "test2@example.com",
        "password": "secure_password_123"
    })
    
    # Then login
    response = client.post("/auth/login", json={
        "email": "test2@example.com",
        "password": "secure_password_123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()
```

---

### Frontend Testing

**Note:** Frontend currently has no test suite. Contributions welcome!

**Recommended Stack:**
- **Vitest** — Fast unit testing
- **Testing Library** — React component testing
- **Playwright** — E2E testing

**Example Setup:**
```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Example Test:**
```typescript
// frontend/src/components/__tests__/ChatMessage.test.tsx
import { render, screen } from '@testing-library/react';
import { ChatMessage } from '../ChatMessage';

describe('ChatMessage', () => {
  it('renders user message', () => {
    const message = {
      id: '1',
      role: 'user' as const,
      content: 'Hello AI',
      timestamp: new Date()
    };
    
    render(<ChatMessage message={message} />);
    expect(screen.getByText('Hello AI')).toBeInTheDocument();
  });
});
```

---

## Debugging

### Backend Debugging

#### 1. Python Debugger (pdb)

```python
# Add breakpoint
import pdb; pdb.set_trace()

# Or use built-in breakpoint()
breakpoint()
```

#### 2. VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "src.auth.routes:app",
        "--reload"
      ],
      "cwd": "${workspaceFolder}/backend"
    },
    {
      "name": "LangGraph",
      "type": "python",
      "request": "launch",
      "module": "langgraph",
      "args": ["dev", "--no-browser"],
      "cwd": "${workspaceFolder}/backend"
    }
  ]
}
```

#### 3. Logging

```python
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

logger.debug("Detailed debug info")
logger.info("General information")
logger.warning("Warning message")
logger.error("Error occurred")
logger.exception("Exception with traceback")
```

---

### Frontend Debugging

#### 1. React DevTools

Install browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

#### 2. Console Logging

```typescript
console.log('Variable:', variable);
console.error('Error:', error);
console.table(arrayOfObjects);
console.trace(); // Stack trace
```

#### 3. VS Code Debugging

Install "Debugger for Chrome" extension, then add to `.vscode/launch.json`:

```json
{
  "type": "chrome",
  "request": "launch",
  "name": "Launch Chrome",
  "url": "http://localhost:5173",
  "webRoot": "${workspaceFolder}/frontend/src"
}
```

---

## Contributing Guidelines

### How to Contribute

1. **Find or Create an Issue**
   - Browse [existing issues](https://github.com/N1KH1LT0X1N/Pharma-Agent/issues)
   - Comment to claim an issue
   - Or create a new issue for discussion

2. **Fork & Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Write code following style guide
   - Add tests for new functionality
   - Update documentation

4. **Test Locally**
   ```bash
   # Backend
   cd backend && uv run pytest
   
   # Frontend
   cd frontend && npm run build
   ```

5. **Commit & Push**
   ```bash
   git add .
   git commit -m "feat(agent): add amazing feature"
   git push origin feature/amazing-feature
   ```

6. **Open Pull Request**
   - Describe changes clearly
   - Link related issues
   - Wait for review

---

### Code Review Criteria

Reviewers will check:

- [ ] **Functionality** — Code works as intended
- [ ] **Tests** — New code has test coverage
- [ ] **Style** — Follows project code style
- [ ] **Documentation** — Public APIs are documented
- [ ] **Performance** — No obvious performance issues
- [ ] **Security** — No security vulnerabilities
- [ ] **Breaking Changes** — Clearly marked if any

---

## Pull Request Process

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guide
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

---

### After PR Submission

1. **Address Review Feedback**
   - Make requested changes
   - Respond to comments
   - Push updates

2. **Squash Commits (if requested)**
   ```bash
   git rebase -i HEAD~3  # Squash last 3 commits
   git push --force-with-lease
   ```

3. **Merge**
   - Maintainers will merge when approved
   - Delete your branch after merge

---

## Contribution Ideas

### Good First Issues

- 🐛 **Bug Fixes** — Fix reported bugs
- 📚 **Documentation** — Improve docs and examples
- 🎨 **UI Enhancements** — Improve styling and UX
- ✅ **Testing** — Add test coverage
- 🌐 **Internationalization** — Add language support

### Advanced Contributions

- 🤖 **New Agents** — Implement specialized research agents
- 🔧 **New Tools** — Create LangChain tools for data sources
- 🔌 **Connectors** — Integrate real APIs (IQVIA, USPTO, etc.)
- ⚡ **Performance** — Optimize agent execution
- 🔒 **Security** — Enhance authentication and authorization

---

## Related Documentation

- [Architecture](architecture.md) — System architecture
- [API Reference](api.md) — API documentation
- [Configuration](configuration.md) — Environment setup
- [Agents](agents.md) — Agent implementation details

---

**Questions?** Open an issue on GitHub or join our discussions!

**Thank you for contributing to Pramana.ai! 🙏**
