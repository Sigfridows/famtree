"""Local image adapter: validate bytes, re-encode, and allocate server-owned names."""

import asyncio
import io
import re
from pathlib import Path
from uuid import uuid4

from PIL import Image, UnidentifiedImageError

from app.core.errors import AppError


class ImageStore:
    def __init__(self, root: Path) -> None:
        self.root = root

    async def save(self, data: bytes, *, profile: bool = False) -> str:
        return await asyncio.to_thread(self._save, data, profile)

    def _save(self, data: bytes, profile: bool) -> str:
        maximum = (2 if profile else 5) * 1024 * 1024
        if not data or len(data) > maximum:
            raise AppError(
                code="image_size", message="Tamaño de imagen no permitido", status_code=422
            )
        try:
            with Image.open(io.BytesIO(data)) as source:
                allowed = {"JPEG", "PNG"} if profile else {"JPEG", "PNG", "WEBP"}
                if source.format not in allowed or source.width * source.height > 20_000_000:
                    raise ValueError("Unsupported image")
                source.load()
                clean = source.convert("RGB")
                clean.thumbnail((2048, 2048))
                name = f"{uuid4().hex}.jpg"
                self.root.mkdir(parents=True, exist_ok=True)
                clean.save(self.root / name, "JPEG", quality=85)
                return f"/media/{name}"
        except (ValueError, OSError, UnidentifiedImageError, Image.DecompressionBombError) as exc:
            raise AppError(
                code="invalid_image", message="Formato de imagen no permitido", status_code=422
            ) from exc

    async def delete(self, url: str | None) -> None:
        if url and re.fullmatch(r"/media/[a-f0-9]{32}\.jpg", url):
            await asyncio.to_thread((self.root / url.rsplit("/", 1)[1]).unlink, missing_ok=True)
