"""Persistence boundary injected into discovery use cases."""

from typing import Protocol

from app.modules.asylums.schemas import AsylumDetail, AsylumSummary, Catalogs, SearchQuery


class AsylumReader(Protocol):
    async def search(
        self, query: SearchQuery, *, page_size: int
    ) -> tuple[list[AsylumSummary], int]: ...

    async def details(self, ids: list[int]) -> list[AsylumDetail]: ...

    async def catalogs(self, province_id: int | None) -> Catalogs: ...
