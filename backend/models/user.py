# Generated from @specs/database/schema.md
"""User model for the Todo application.

Defines the User entity for Better Auth integration.
Better Auth manages the actual user table; this model is for
querying and relationship purposes.
"""

from typing import Optional

from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    """User database model.

    Note: This table is managed by Better Auth.
    We define it here for SQLModel relationships and queries.

    Attributes:
        id: UUID primary key (from Better Auth)
        email: Unique email address
        name: Optional display name
    """

    __tablename__ = "user"

    id: str = Field(primary_key=True)  # UUID from Better Auth
    email: str = Field(unique=True, index=True)
    name: Optional[str] = Field(default=None)
