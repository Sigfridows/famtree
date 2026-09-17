from app.core.errors import AppError
from app.modules.asylums.ports import AsylumReader
from app.modules.asylums.schemas import (
    MAP_PAGE_SIZE,
    PAGE_SIZE,
    AsylumDetail,
    AsylumPage,
    Catalogs,
    Comparison,
    ComparisonQuery,
    MapPage,
    MapPin,
    Pagination,
    SearchQuery,
)


def pagination(page: int, page_size: int, total: int) -> Pagination:
    return Pagination(
        page=page, page_size=page_size, total=total, pages=(total + page_size - 1) // page_size
    )


class AsylumService:
    def __init__(self, reader: AsylumReader) -> None:
        self.reader = reader

    async def search(self, query: SearchQuery) -> AsylumPage:
        items, total = await self.reader.search(query, page_size=PAGE_SIZE)
        return AsylumPage(
            items=items, pagination=pagination(query.page, PAGE_SIZE, total), filters=query
        )

    async def map(self, query: SearchQuery) -> MapPage:
        items, total = await self.reader.search(query, page_size=MAP_PAGE_SIZE)
        return MapPage(
            items=[MapPin.model_validate(item.model_dump()) for item in items],
            pagination=pagination(query.page, MAP_PAGE_SIZE, total),
            filters=query,
        )

    async def detail(self, asylum_id: int) -> AsylumDetail:
        items = await self.reader.details([asylum_id])
        if not items:
            raise AppError(code="asylum_not_found", message="Centro no disponible", status_code=404)
        return items[0]

    async def compare(self, query: ComparisonQuery) -> Comparison:
        items = await self.reader.details(query.ids)
        by_id = {item.id: item for item in items}
        if any(asylum_id not in by_id for asylum_id in query.ids):
            raise AppError(
                code="asylum_not_found",
                message="Uno o más centros no están disponibles",
                status_code=404,
            )
        return Comparison(items=[by_id[asylum_id] for asylum_id in query.ids])

    async def catalogs(self, province_id: int | None) -> Catalogs:
        return await self.reader.catalogs(province_id)
