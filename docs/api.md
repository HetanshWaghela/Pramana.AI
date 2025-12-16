# API Reference

Complete API documentation for Pramana.ai's backend services.

## Table of Contents

- [LangGraph API](#langgraph-api)
- [FastAPI Authentication](#fastapi-authentication)
- [Chat History API](#chat-history-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## LangGraph API

**Base URL:** `http://localhost:2024`  
**Documentation:** `http://localhost:2024/docs`

The LangGraph API handles all agent interactions and provides a RESTful interface for managing threads (conversations) and submitting messages to AI agents.

### Endpoints

#### List Available Agents

```http
GET /assistants
```

**Response:**
```json
[
  {
    "assistant_id": "portfolio_strategist",
    "graph_id": "portfolio_strategist",
    "config": {
      "configurable": {}
    },
    "created_at": "2024-12-16T00:00:00Z",
    "metadata": {}
  },
  {
    "assistant_id": "deep_researcher",
    "graph_id": "deep_researcher",
    "config": {...},
    "created_at": "2024-12-16T00:00:00Z",
    "metadata": {}
  },
  {
    "assistant_id": "chatbot",
    "graph_id": "chatbot",
    "config": {...},
    "created_at": "2024-12-16T00:00:00Z",
    "metadata": {}
  },
  {
    "assistant_id": "math_agent",
    "graph_id": "math_agent",
    "config": {...},
    "created_at": "2024-12-16T00:00:00Z",
    "metadata": {}
  },
  {
    "assistant_id": "mcp_agent",
    "graph_id": "mcp_agent",
    "config": {...},
    "created_at": "2024-12-16T00:00:00Z",
    "metadata": {}
  }
]
```

---

#### Create Thread

```http
POST /threads
```

Creates a new conversation thread.

**Request Body:**
```json
{
  "metadata": {
    "user_id": "optional_user_id"
  }
}
```

**Response:**
```json
{
  "thread_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2024-12-16T12:00:00Z",
  "metadata": {
    "user_id": "optional_user_id"
  }
}
```

---

#### Get Thread

```http
GET /threads/{thread_id}
```

Retrieves thread information and current state.

**Response:**
```json
{
  "thread_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2024-12-16T12:00:00Z",
  "metadata": {},
  "values": {
    "messages": [
      {
        "type": "human",
        "content": "Analyze metformin for anti-aging in the US",
        "timestamp": "2024-12-16T12:00:10Z"
      },
      {
        "type": "ai",
        "content": "I'll analyze this opportunity...",
        "timestamp": "2024-12-16T12:00:15Z"
      }
    ]
  }
}
```

---

#### Submit Message to Agent

```http
POST /threads/{thread_id}/runs
```

Submits a message to an AI agent and initiates a run.

**Request Body:**
```json
{
  "assistant_id": "deep_researcher",
  "input": {
    "messages": [
      {
        "role": "user",
        "content": "Research CRISPR gene therapy safety"
      }
    ]
  },
  "config": {
    "configurable": {
      "initial_search_query_count": 3,
      "max_research_loops": 2
    }
  },
  "stream_mode": ["values", "updates"],
  "stream_subgraphs": true
}
```

**Response:**
```json
{
  "run_id": "660e8400-e29b-41d4-a716-446655440000",
  "thread_id": "550e8400-e29b-41d4-a716-446655440000",
  "assistant_id": "deep_researcher",
  "created_at": "2024-12-16T12:01:00Z",
  "status": "pending"
}
```

---

#### Stream Agent Response

```http
GET /threads/{thread_id}/runs/{run_id}/stream
```

Streams the agent's response in real-time using Server-Sent Events (SSE).

**Response:** (Server-Sent Events)

```
event: metadata
data: {"run_id": "660e8400-..."}

event: values
data: {"messages": [{"type": "ai", "content": "I'll research..."}]}

event: updates
data: {"tool_calls": [{"tool": "web_search", "args": {...}}]}

event: end
data: {"status": "success"}
```

**Event Types:**

| Event | Description |
|-------|-------------|
| `metadata` | Run metadata (ID, agent, config) |
| `values` | Current state values (messages, etc.) |
| `updates` | Incremental updates (tool calls, thinking steps) |
| `error` | Error occurred during execution |
| `end` | Run completed successfully |

---

#### Get Run Status

```http
GET /threads/{thread_id}/runs/{run_id}
```

**Response:**
```json
{
  "run_id": "660e8400-e29b-41d4-a716-446655440000",
  "thread_id": "550e8400-e29b-41d4-a716-446655440000",
  "assistant_id": "deep_researcher",
  "status": "success",
  "created_at": "2024-12-16T12:01:00Z",
  "updated_at": "2024-12-16T12:01:45Z"
}
```

**Status Values:**
- `pending` — Queued for execution
- `running` — Currently executing
- `success` — Completed successfully
- `error` — Failed with error

---

### Configuration Options

#### Deep Researcher Configuration

```json
{
  "configurable": {
    "initial_search_query_count": 3,
    "max_research_loops": 2,
    "search_result_limit": 10,
    "reasoning_model": "llama-3.3-70b-versatile",
    "response_model": "llama-3.3-70b-versatile"
  }
}
```

#### Portfolio Strategist Configuration

```json
{
  "configurable": {
    "max_parallel_workers": 6,
    "timeout_per_worker": 30,
    "heuristic_weights": {
      "whitespace": 1.0,
      "patent_window": 0.8,
      "market_growth": 0.9
    }
  }
}
```

---

## FastAPI Authentication

**Base URL:** `http://localhost:8000`

### Endpoints

#### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "created_at": "2024-12-16T12:00:00Z"
}
```

**Status Codes:**
- `201 Created` — User registered successfully
- `400 Bad Request` — Email already exists or validation error
- `422 Unprocessable Entity` — Invalid request format

---

#### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password_123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2024-12-16T12:00:00Z"
  }
}
```

**Status Codes:**
- `200 OK` — Login successful
- `401 Unauthorized` — Invalid credentials

**Token Usage:**

Include the token in the `Authorization` header for protected endpoints:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Chat History API

**Base URL:** `http://localhost:8000`  
**Authentication:** Required (JWT token)

### Endpoints

#### Get All Chats

```http
GET /chats/
```

Retrieves all chat conversations for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "title": "CRISPR Gene Therapy Research",
    "agent": "deep_researcher",
    "created_at": "2024-12-16T12:00:00Z"
  },
  {
    "id": 2,
    "user_id": 1,
    "title": "Metformin Anti-Aging Analysis",
    "agent": "portfolio_strategist",
    "created_at": "2024-12-16T11:00:00Z"
  }
]
```

---

#### Create Chat

```http
POST /chats/
```

Creates a new chat conversation.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "New Research Topic",
  "agent": "deep_researcher"
}
```

**Response:**
```json
{
  "id": 3,
  "user_id": 1,
  "title": "New Research Topic",
  "agent": "deep_researcher",
  "created_at": "2024-12-16T13:00:00Z"
}
```

---

#### Get Chat with Messages

```http
GET /chats/{chat_id}
```

Retrieves a specific chat conversation with all messages.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "user_id": 1,
  "title": "CRISPR Gene Therapy Research",
  "agent": "deep_researcher",
  "created_at": "2024-12-16T12:00:00Z",
  "messages": [
    {
      "id": 1,
      "chat_id": 1,
      "role": "user",
      "content": "Research CRISPR gene therapy safety",
      "timestamp": "2024-12-16T12:00:10Z"
    },
    {
      "id": 2,
      "chat_id": 1,
      "role": "assistant",
      "content": "I'll research CRISPR safety data...",
      "timestamp": "2024-12-16T12:00:15Z"
    }
  ]
}
```

---

#### Delete Chat

```http
DELETE /chats/{chat_id}
```

Deletes a chat conversation and all associated messages.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Chat deleted successfully"
}
```

**Status Codes:**
- `200 OK` — Chat deleted
- `403 Forbidden` — User does not own this chat
- `404 Not Found` — Chat does not exist

---

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "constraint": "format"
    }
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

**Development:** No rate limits  
**Production:** Recommended limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/register` | 5 requests | 1 hour |
| `/auth/login` | 10 requests | 15 minutes |
| `/threads` (create) | 100 requests | 1 hour |
| `/threads/{id}/runs` (submit) | 50 requests | 1 hour |
| `/chats/*` | 1000 requests | 1 hour |

**Headers:**
```
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1702742400
```

---

## Client Examples

### JavaScript/TypeScript

```typescript
// Create thread and submit message
async function askAgent(agentId: string, message: string) {
  // 1. Create thread
  const threadResponse = await fetch('http://localhost:2024/threads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata: {} })
  });
  const { thread_id } = await threadResponse.json();

  // 2. Submit message
  const runResponse = await fetch(`http://localhost:2024/threads/${thread_id}/runs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assistant_id: agentId,
      input: {
        messages: [{ role: 'user', content: message }]
      },
      stream_mode: ['values', 'updates']
    })
  });
  const { run_id } = await runResponse.json();

  // 3. Stream response
  const eventSource = new EventSource(
    `http://localhost:2024/threads/${thread_id}/runs/${run_id}/stream`
  );

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('Agent update:', data);
  };

  eventSource.addEventListener('end', () => {
    eventSource.close();
    console.log('Agent finished');
  });
}
```

### Python

```python
import httpx

async def ask_agent(agent_id: str, message: str):
    async with httpx.AsyncClient() as client:
        # Create thread
        thread_resp = await client.post(
            "http://localhost:2024/threads",
            json={"metadata": {}}
        )
        thread_id = thread_resp.json()["thread_id"]
        
        # Submit message
        run_resp = await client.post(
            f"http://localhost:2024/threads/{thread_id}/runs",
            json={
                "assistant_id": agent_id,
                "input": {
                    "messages": [{"role": "user", "content": message}]
                },
                "stream_mode": ["values", "updates"]
            }
        )
        run_id = run_resp.json()["run_id"]
        
        # Stream response
        async with client.stream(
            "GET",
            f"http://localhost:2024/threads/{thread_id}/runs/{run_id}/stream"
        ) as stream:
            async for line in stream.aiter_lines():
                if line.startswith("data: "):
                    data = json.loads(line[6:])
                    print("Agent update:", data)
```

---

## Related Documentation

- [Agents](agents.md) — Agent capabilities and configuration
- [Architecture](architecture.md) — System architecture overview
- [Configuration](configuration.md) — Environment setup
- [Development](development.md) — Development workflow

---

**Questions?** Check the [Troubleshooting Guide](troubleshooting.md) or open an issue on GitHub.
