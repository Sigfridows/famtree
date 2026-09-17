"""Public discovery contracts. Money is serialized as decimal strings."""

from decimal import Decimal
from enum import StrEnum
from typing import Annotated, Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

PublicId = Annotated[int, Field(gt=0, le=9_007_199_254_740_991)]
Price = Annotated[Decimal, Field(ge=0, max_digits=10, decimal_places=2)]
PAGE_SIZE = 15
MAP_PAGE_SIZE = 100


class SortOrder(StrEnum):
    NAME_ASC = "name_asc"
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"
    RATING_DESC = "rating_desc"


def parse_ids(value: object) -> object:
    """Accept repeated query parameters and comma-separated IDs."""
    if isinstance(value, str):
        return value.split(",")
    if isinstance(value, list):
        return [part for item in value for part in str(item).split(",")]
    return value


class SearchQuery(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    q: str | None = Field(default=None, max_length=100)
    province_id: PublicId | None = None
    municipality_id: PublicId | None = None
    min_price: Price | None = None
    max_price: Price | None = None
    services: list[PublicId] = Field(default_factory=list, max_length=30)
    care_types: list[PublicId] = Field(default_factory=list, max_length=30)
    certified_only: bool = False
    rating_min: float | None = Field(default=None, ge=1, le=5, allow_inf_nan=False)
    sort: SortOrder = SortOrder.NAME_ASC
    page: int = Field(default=1, ge=1, le=1_000_000)

    @field_validator("services", "care_types", mode="before")
    @classmethod
    def split_ids(cls, value: object) -> object:
        return parse_ids(value)

    @field_validator("services", "care_types")
    @classmethod
    def unique_ids(cls, value: list[int]) -> list[int]:
        return list(dict.fromkeys(value))

    @model_validator(mode="after")
    def valid_price_range(self) -> Self:
        if (
            self.min_price is not None
            and self.max_price is not None
            and self.min_price > self.max_price
        ):
            raise ValueError("min_price must be less than or equal to max_price")
        return self


class ComparisonQuery(BaseModel):
    model_config = ConfigDict(extra="forbid")
    ids: list[PublicId] = Field(min_length=2, max_length=4)

    @field_validator("ids", mode="before")
    @classmethod
    def split_ids(cls, value: object) -> object:
        return parse_ids(value)

    @field_validator("ids")
    @classmethod
    def distinct_ids(cls, value: list[int]) -> list[int]:
        if len(set(value)) != len(value):
            raise ValueError("Comparison requires distinct asylum IDs")
        return value


class CatalogOption(BaseModel):
    id: int
    name: str


class MunicipalityOption(CatalogOption):
    province_id: int


class Catalogs(BaseModel):
    provinces: list[CatalogOption]
    municipalities: list[MunicipalityOption]
    services: list[CatalogOption]
    care_types: list[CatalogOption]


class AsylumSummary(BaseModel):
    id: int
    name: str
    province_id: int
    province_name: str
    municipality_id: int
    municipality_name: str
    sector: str
    address: str
    latitude: float
    longitude: float
    price_min: Decimal
    price_max: Decimal
    cover_url: str | None
    rating: float | None
    review_count: int


class AsylumImage(BaseModel):
    id: int
    url: str
    is_cover: bool


class AsylumDetail(AsylumSummary):
    description: str
    admission_requirements: str
    capacity: int
    certifications: str | None
    phone: str
    email: str
    website: str | None
    images: list[AsylumImage]
    services: list[CatalogOption]
    care_types: list[CatalogOption]


class Pagination(BaseModel):
    page: int
    page_size: int
    total: int
    pages: int


class AsylumPage(BaseModel):
    items: list[AsylumSummary]
    pagination: Pagination
    filters: SearchQuery


class MapPin(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    price_min: Decimal
    price_max: Decimal
    cover_url: str | None
    rating: float | None
    review_count: int


class MapPage(BaseModel):
    items: list[MapPin]
    pagination: Pagination
    filters: SearchQuery


class Comparison(BaseModel):
    items: list[AsylumDetail]
