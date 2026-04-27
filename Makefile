.PHONY: help install dev dev-api dev-web build build-api build-web clean test

# Default target
help:
	@echo "Hotwash - Development Commands"
	@echo ""
	@echo "Available targets:"
	@echo "  make install    - Install all dependencies (backend + frontend)"
	@echo "  make dev        - Run both backend and frontend in dev mode"
	@echo "  make dev-api    - Run backend API server only"
	@echo "  make dev-web    - Run frontend dev server only"
	@echo "  make build      - Build production artifacts"
	@echo "  make build-api  - Build backend (validation only)"
	@echo "  make build-web  - Build frontend production bundle"
	@echo "  make clean      - Remove build artifacts and caches"
	@echo "  make test       - Run all tests"
	@echo ""

# Install all dependencies
install:
	@echo "Installing backend dependencies..."
	pip install -r requirements.txt
	@echo ""
	@echo "Installing frontend dependencies..."
	cd web && npm install
	@echo ""
	@echo "Installation complete!"

# Run both backend and frontend in development mode
dev:
	@echo "Starting development servers..."
	@echo "Backend: http://localhost:8000"
	@echo "Frontend: http://localhost:3000"
	@echo ""
	@echo "Note: Run 'make dev-api' and 'make dev-web' in separate terminals"
	@echo "      or use a process manager like tmux/screen"

# Run backend API server
dev-api:
	@echo "Starting FastAPI backend on http://localhost:8000"
	@echo "API docs available at http://localhost:8000/docs"
	uvicorn api.main:app --reload --host 0.0.0.0 --port 8000

# Run frontend dev server
dev-web:
	@echo "Starting React frontend on http://localhost:3000"
	cd web && npm start

# Build production artifacts
build: build-api build-web
	@echo ""
	@echo "Build complete!"
	@echo "Backend: Ready for deployment with uvicorn"
	@echo "Frontend: Build artifacts in web/build/"

# Validate backend (no build step needed for Python)
build-api:
	@echo "Validating backend code..."
	python -m py_compile api/main.py api/models.py api/routers/playbooks.py api/parsers/markdown_parser.py api/parsers/mermaid_parser.py
	@echo "Backend validation complete!"

# Build frontend production bundle
build-web:
	@echo "Building frontend production bundle..."
	cd web && npm run build
	@echo "Frontend build complete! Artifacts in web/build/"

# Clean build artifacts and caches
clean:
	@echo "Cleaning build artifacts..."
	rm -rf web/build
	rm -rf web/node_modules
	rm -rf api/__pycache__
	rm -rf api/routers/__pycache__
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "Clean complete!"

# Run tests
test:
	@echo "Running backend tests..."
	python3 -m pytest api/tests/ -v
	@echo ""
	@echo "Running manual test suite..."
	python3 api/tests/run_parser_tests.py
	@echo ""
	@echo "All tests complete!"
