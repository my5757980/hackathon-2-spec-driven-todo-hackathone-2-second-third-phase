# Generated from @specs/features/authentication/spec.md
"""FastAPI application entry point.

Main application setup with middleware, CORS configuration,
and route registration.
"""

# IMPORTANT: Load environment variables BEFORE any other imports
# that might need them (db.py, auth.py, etc.)
from dotenv import load_dotenv
load_dotenv()

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routes AFTER load_dotenv() so DATABASE_URL is available
from routes.tasks import router as tasks_router
from db import create_db_and_tables


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager.

    Handles startup and shutdown events.
    """
    # Startup: verify required environment variables
    required_vars = ["BETTER_AUTH_SECRET"]
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        import logging
        logging.warning(f"Missing environment variables: {', '.join(missing)}")

    # Create database tables if they don't exist
    await create_db_and_tables()

    yield

    # Shutdown: cleanup if needed
    pass


# Create FastAPI application
app = FastAPI(
    title="Todo App API",
    description="RESTful API for the multi-user Todo application",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
# In production, replace "*" with specific frontend origin
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy"}


# API info endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "Todo App API",
        "version": "1.0.0",
        "docs": "/docs",
    }


# Register routers
app.include_router(tasks_router)
