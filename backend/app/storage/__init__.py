"""Storage abstractions for local MVP files and future adapters."""

from app.storage.local import LocalStorage
from app.storage.protocol import Storage

__all__ = ["LocalStorage", "Storage"]
