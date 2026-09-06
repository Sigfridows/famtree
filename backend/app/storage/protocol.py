from pathlib import Path
from typing import Protocol


class Storage(Protocol):
    """Minimal storage contract independent of any cloud provider."""

    def put(self, relative_path: str, content: bytes) -> Path: ...

    def delete(self, relative_path: str) -> None: ...
