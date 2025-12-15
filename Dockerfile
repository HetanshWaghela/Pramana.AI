# ══════════════════════════════════════════════════════════════════════════════
# Pramana.ai - Biomedical Research Platform
# Multi-stage Docker build for production deployment
# ══════════════════════════════════════════════════════════════════════════════

# ──────────────────────────────────────────────────────────────────────────────
# Stage 1: Build React Frontend
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package.json ./
COPY frontend/package-lock.json ./
RUN npm install

# Copy source and build
COPY frontend/ ./
RUN npm run build

# ──────────────────────────────────────────────────────────────────────────────
# Stage 2: Python Backend with LangGraph
# ──────────────────────────────────────────────────────────────────────────────
FROM docker.io/langchain/langgraph-api:3.11

# Install UV, Node.js, and MCP dependencies
RUN apt-get update && apt-get install -y curl gnupg2 && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    curl -LsSf https://astral.sh/uv/install.sh | sh && \
    apt-get clean && rm -rf /var/lib/apt/lists/*
ENV PATH="/root/.local/bin:$PATH"

# Install MCP servers globally
RUN npm install -g @modelcontextprotocol/server-filesystem @modelcontextprotocol/server-brave-search

# ──────────────────────────────────────────────────────────────────────────────
# Copy frontend build from builder stage
# ──────────────────────────────────────────────────────────────────────────────
COPY --from=frontend-builder /app/frontend/dist /deps/frontend/dist

# ──────────────────────────────────────────────────────────────────────────────
# Copy and install backend
# ──────────────────────────────────────────────────────────────────────────────
ADD backend/ /deps/backend

# Install Python dependencies
RUN uv pip install --system pip setuptools wheel
RUN cd /deps/backend && \
    PYTHONDONTWRITEBYTECODE=1 UV_SYSTEM_PYTHON=1 uv pip install --system -c /api/constraints.txt -e .

# ──────────────────────────────────────────────────────────────────────────────
# LangGraph Configuration
# ──────────────────────────────────────────────────────────────────────────────
ENV LANGGRAPH_HTTP='{"app": "/deps/backend/src/agent/app.py:app"}'
ENV LANGSERVE_GRAPHS='{"deep_researcher": "/deps/backend/src/agent/deep_researcher.py:deep_researcher_graph", "chatbot": "/deps/backend/src/agent/chatbot_graph.py:chatbot_graph", "mcp_agent": "/deps/backend/src/agent/mcp_agent.py:mcp_agent_graph", "math_agent": "/deps/backend/src/agent/math_agent.py:math_agent_graph"}'

# ──────────────────────────────────────────────────────────────────────────────
# MCP Configuration
# ──────────────────────────────────────────────────────────────────────────────
ENV MCP_FILESYSTEM_ENABLED=true
ENV MCP_FILESYSTEM_PATH=/app/workspace
ENV MCP_BRAVE_SEARCH_ENABLED=true

# Create MCP workspace directory
RUN mkdir -p /app/workspace && chmod 755 /app/workspace

# ──────────────────────────────────────────────────────────────────────────────
# Finalize LangGraph API
# ──────────────────────────────────────────────────────────────────────────────
RUN mkdir -p /api/langgraph_api /api/langgraph_runtime /api/langgraph_license /api/langgraph_storage && \
    touch /api/langgraph_api/__init__.py /api/langgraph_runtime/__init__.py /api/langgraph_license/__init__.py /api/langgraph_storage/__init__.py
RUN PYTHONDONTWRITEBYTECODE=1 pip install --no-cache-dir --no-deps -e /api

# Clean up pip
RUN uv pip uninstall --system pip setuptools wheel && \
    rm -rf /usr/local/lib/python*/site-packages/pip* /usr/local/lib/python*/site-packages/setuptools* /usr/local/lib/python*/site-packages/wheel* && \
    find /usr/local/bin -name "pip*" -delete

WORKDIR /deps/backend

# ══════════════════════════════════════════════════════════════════════════════
# Pramana.ai - Built by team GitGonewild
# ══════════════════════════════════════════════════════════════════════════════
