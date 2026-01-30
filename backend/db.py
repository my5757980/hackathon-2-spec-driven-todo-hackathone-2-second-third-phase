# Generated from @specs/database/schema.md
"""Database connection and session management.

Configures SQLModel with Neon PostgreSQL and provides session dependencies.
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlmodel import SQLModel

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set. "
        "Please set it in backend/.env or export it."
    )

# For async support with Neon, use asyncpg
# Convert postgres:// to postgresql+asyncpg://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Remove sslmode parameter (asyncpg uses ssl=True instead)
# Replace sslmode=require with ssl=require for asyncpg compatibility
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse

parsed = urlparse(DATABASE_URL)
query_params = parse_qs(parsed.query)

# Check if sslmode is set and remove it
ssl_required = False
if 'sslmode' in query_params:
    ssl_value = query_params.pop('sslmode')[0]
    ssl_required = ssl_value in ['require', 'verify-ca', 'verify-full']
if 'channel_binding' in query_params:
    query_params.pop('channel_binding')  # Not supported by asyncpg

# Rebuild URL without sslmode
new_query = urlencode(query_params, doseq=True)
DATABASE_URL = urlunparse((
    parsed.scheme, parsed.netloc, parsed.path,
    parsed.params, new_query, parsed.fragment
))

# Create async engine with SSL for Neon
import ssl as ssl_module
ssl_context = ssl_module.create_default_context() if ssl_required else None

engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG", "false").lower() == "true",
    pool_pre_ping=True,
    connect_args={"ssl": ssl_context} if ssl_required else {},
)

# Create async session factory
async_session_maker = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def create_db_and_tables():
    """Create database tables.

    Called during application startup.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session dependency.

    Yields an async session for route handlers.

    Usage:
        @app.get("/items")
        async def get_items(session: AsyncSession = Depends(get_session)):
            ...
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


@asynccontextmanager
async def get_session_context():
    """Get database session as async context manager.

    For use outside of FastAPI dependency injection.

    Usage:
        async with get_session_context() as session:
            ...
    """
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()
