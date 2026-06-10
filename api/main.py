"""
Hotwash API - Main Application Entry Point

FastAPI backend for converting markdown/mermaid playbooks to visual IR flowcharts.
"""

import logging
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.auth import initialize_api_key
from api.crypto import get_cipher
from api.database import init_db
from api.seed import seed_db
from api.routers import executions, export, ingest, integrations, parse, playbooks
from api.routers.executions import ws_router as executions_ws_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_api_key()
    get_cipher()
    init_db()
    seed_db()
    yield


app = FastAPI(
    title="Hotwash API",
    description="Convert markdown/mermaid playbooks to visual IR flowcharts",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS middleware for the React frontend. Defaults cover local dev only;
# set HOTWASH_CORS_ORIGINS (comma-separated) for any non-localhost deployment.
_DEFAULT_CORS_ORIGINS = "http://localhost:5177,http://localhost:3000"
_cors_origins = [
    origin.strip()
    for origin in os.environ.get("HOTWASH_CORS_ORIGINS", _DEFAULT_CORS_ORIGINS).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
)

# Register routers
app.include_router(parse.router, prefix="/api", tags=["parse"])
app.include_router(playbooks.router, prefix="/api", tags=["playbooks"])
app.include_router(playbooks.shared_router, prefix="/api", tags=["playbooks"])
app.include_router(export.router, prefix="/api", tags=["export"])
app.include_router(integrations.router, prefix="/api", tags=["integrations"])
app.include_router(executions.router, prefix="/api", tags=["executions"])
app.include_router(executions_ws_router, prefix="/api", tags=["executions"])
app.include_router(ingest.webhook_router, prefix="/api", tags=["ingest"])
app.include_router(ingest.mappings_router, prefix="/api", tags=["ingest"])
app.include_router(ingest.suggestions_router, prefix="/api", tags=["ingest"])


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler returning structured JSON errors."""
    logger.exception("Unhandled exception during request %s %s", request.method, request.url.path, exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": "Internal server error"
        }
    )


@app.get("/")
async def root():
    """Health check endpoint."""
    return {"status": "ok", "service": "hotwash-api"}


@app.get("/api/health")
async def health():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "service": "hotwash-api",
        "version": "0.1.0"
    }
