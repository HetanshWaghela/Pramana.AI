# ══════════════════════════════════════════════════════════════════════════════
# Pramana.ai Backend - Development Commands
# ══════════════════════════════════════════════════════════════════════════════

.PHONY: all format lint test tests test_watch integration_tests docker_tests help extended_tests

# Default target
all: help

# Define test file path
TEST_FILE ?= tests/unit_tests/

# ──────────────────────────────────────────────────────────────────────────────
# Testing
# ──────────────────────────────────────────────────────────────────────────────

test:
	uv run --with-editable . pytest $(TEST_FILE)

test_watch:
	uv run --with-editable . ptw --snapshot-update --now . -- -vv tests/unit_tests

test_profile:
	uv run --with-editable . pytest -vv tests/unit_tests/ --profile-svg

extended_tests:
	uv run --with-editable . pytest --only-extended $(TEST_FILE)

# ──────────────────────────────────────────────────────────────────────────────
# Linting and Formatting
# ──────────────────────────────────────────────────────────────────────────────

PYTHON_FILES=src/
MYPY_CACHE=.mypy_cache
lint format: PYTHON_FILES=.
lint_diff format_diff: PYTHON_FILES=$(shell git diff --name-only --diff-filter=d main | grep -E '\.py$$|\.ipynb$$')
lint_package: PYTHON_FILES=src
lint_tests: PYTHON_FILES=tests
lint_tests: MYPY_CACHE=.mypy_cache_test

lint lint_diff lint_package lint_tests:
	uv run ruff check .
	[ "$(PYTHON_FILES)" = "" ] || uv run ruff format $(PYTHON_FILES) --diff
	[ "$(PYTHON_FILES)" = "" ] || uv run ruff check --select I $(PYTHON_FILES)
	[ "$(PYTHON_FILES)" = "" ] || uv run mypy --strict $(PYTHON_FILES)
	[ "$(PYTHON_FILES)" = "" ] || mkdir -p $(MYPY_CACHE) && uv run mypy --strict $(PYTHON_FILES) --cache-dir $(MYPY_CACHE)

format format_diff:
	uv run ruff format $(PYTHON_FILES)
	uv run ruff check --select I --fix $(PYTHON_FILES)

spell_check:
	codespell --toml pyproject.toml

spell_fix:
	codespell --toml pyproject.toml -w

# ──────────────────────────────────────────────────────────────────────────────
# Development
# ──────────────────────────────────────────────────────────────────────────────

dev:
	@echo "🤖 Starting Pramana.ai LangGraph server..."
	uv run langgraph dev --no-browser

# ──────────────────────────────────────────────────────────────────────────────
# Help
# ──────────────────────────────────────────────────────────────────────────────

help:
	@echo ""
	@echo "  ╔═══════════════════════════════════════════════════════════════╗"
	@echo "  ║           🧬 Pramana.ai Backend Commands                      ║"
	@echo "  ╚═══════════════════════════════════════════════════════════════╝"
	@echo ""
	@echo "  Development:"
	@echo "    make dev                       - Start LangGraph dev server"
	@echo ""
	@echo "  Testing:"
	@echo "    make test                      - Run unit tests"
	@echo "    make test TEST_FILE=<file>     - Run specific test file"
	@echo "    make test_watch                - Run tests in watch mode"
	@echo ""
	@echo "  Code Quality:"
	@echo "    make format                    - Format code with ruff"
	@echo "    make lint                      - Run linters"
	@echo ""

# ══════════════════════════════════════════════════════════════════════════════
# Pramana.ai - Built by team GitGonewild
# ══════════════════════════════════════════════════════════════════════════════
