from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base for approved SQLAlchemy models added after the data baseline."""
