from typing import Annotated

from fastapi import APIRouter, Depends, Path, Query

from app.core.errors import ErrorResponse
from app.modules.asylums.dependencies import get_asylum_service
from app.modules.asylums.schemas import (
    AsylumDetail,
    AsylumPage,
    Catalogs,
    Comparison,
    ComparisonQuery,
    MapPage,
    SearchQuery,
)
from app.modules.asylums.service import AsylumService

router = APIRouter(
    prefix="/asylums", tags=["Public discovery"], responses={422: {"model": ErrorResponse}}
)
Service = Annotated[AsylumService, Depends(get_asylum_service)]
Filters = Annotated[SearchQuery, Query()]


@router.get("", response_model=AsylumPage)
async def search_asylums(query: Filters, service: Service) -> AsylumPage:
    """Active centers only, cumulative filters, stable sort, 15 items per page."""
    return await service.search(query)


@router.get("/catalogs", response_model=Catalogs)
async def get_catalogs(
    service: Service,
    province_id: Annotated[int | None, Query(gt=0, le=9_007_199_254_740_991)] = None,
) -> Catalogs:
    """Filter options; province_id restricts municipalities, not the province catalog."""
    return await service.catalogs(province_id)


@router.get("/map", response_model=MapPage)
async def map_asylums(query: Filters, service: Service) -> MapPage:
    """Lightweight pins with identical filters; traverse pages of 100 for all results."""
    return await service.map(query)


@router.get("/compare", response_model=Comparison, responses={404: {"model": ErrorResponse}})
async def compare_asylums(
    query: Annotated[ComparisonQuery, Query()], service: Service
) -> Comparison:
    """Compare 2-4 distinct active IDs, preserving selection order; no partial response."""
    return await service.compare(query)


@router.get("/{asylum_id}", response_model=AsylumDetail, responses={404: {"model": ErrorResponse}})
async def get_asylum(
    asylum_id: Annotated[int, Path(gt=0, le=9_007_199_254_740_991)], service: Service
) -> AsylumDetail:
    return await service.detail(asylum_id)
