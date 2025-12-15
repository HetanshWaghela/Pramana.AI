# ══════════════════════════════════════════════════════════════════════════════
# Pramana.ai - Development Commands
# Master biomedical evidence. Without the silos.
# ══════════════════════════════════════════════════════════════════════════════

.PHONY: help dev-frontend dev-backend dev install clean

# Default target
help:
	@echo ""
	@echo "  ╔═══════════════════════════════════════════════════════════════╗"
	@echo "  ║              🧬 Pramana.ai Development Commands               ║"
	@echo "  ╚═══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "  Development:"
	@echo "    make dev            - Start both frontend and backend servers"
	@echo "    make dev-frontend   - Start frontend only (Vite)"
	@echo "    make dev-backend    - Start backend only (LangGraph)"
	@echo ""
	@echo "  Setup:"
	@echo "    make install        - Install all dependencies"
	@echo "    make clean          - Remove build artifacts"
	@echo ""
	@echo "  Docker:"
	@echo "    make docker-build   - Build Docker image"
	@echo "    make docker-up      - Start with Docker Compose"
	@echo "    make docker-down    - Stop Docker Compose"
	@echo ""

# ──────────────────────────────────────────────────────────────────────────────
# Development
# ──────────────────────────────────────────────────────────────────────────────

dev-frontend:
	@echo "🎨 Starting Pramana.ai frontend..."
	@cd frontend && npm run dev

dev-backend:
	@echo "🤖 Starting Pramana.ai backend..."
	@cd backend && uv run langgraph dev --no-browser

dev:
	@echo "🚀 Starting Pramana.ai development servers..."
	@make dev-frontend & make dev-backend

# ──────────────────────────────────────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────────────────────────────────────

install:
	@echo "📦 Installing Pramana.ai dependencies..."
	@cd backend && uv sync
	@cd frontend && npm install
	@echo "✅ Installation complete!"

clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf frontend/dist
	@rm -rf backend/.venv
	@rm -rf backend/src/*.egg-info
	@echo "✅ Clean complete!"

# ──────────────────────────────────────────────────────────────────────────────
# Docker
# ──────────────────────────────────────────────────────────────────────────────

docker-build:
	@echo "🐳 Building Pramana.ai Docker image..."
	docker build -t pramana-ai:latest -f Dockerfile .

docker-up:
	@echo "🚀 Starting Pramana.ai with Docker Compose..."
	docker-compose up -d

docker-down:
	@echo "🛑 Stopping Pramana.ai Docker Compose..."
	docker-compose down

# ══════════════════════════════════════════════════════════════════════════════
# Built by team GitGonewild
# ══════════════════════════════════════════════════════════════════════════════