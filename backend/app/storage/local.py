from pathlib import Path


class LocalStorage:
    """Filesystem implementation scoped to a configured root directory."""

    def __init__(self, root: Path) -> None:
        self.root = root.resolve()

    def _resolve(self, relative_path: str) -> Path:
        candidate = (self.root / relative_path).resolve()
        if not candidate.is_relative_to(self.root):
            raise ValueError("Storage path must remain inside the configured root")
        return candidate

    def put(self, relative_path: str, content: bytes) -> Path:
        destination = self._resolve(relative_path)
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(content)
        return destination

    def delete(self, relative_path: str) -> None:
        self._resolve(relative_path).unlink(missing_ok=True)
