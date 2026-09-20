from datetime import datetime
from decimal import Decimal
from typing import Annotated, Literal, Self

from pydantic import Field, model_validator

from app.core.contracts import Contract, Id
from app.modules.auth.schemas import Email
from app.modules.users.schemas import Phone

Money = Annotated[Decimal, Field(gt=0, max_digits=10, decimal_places=2)]
Web = Annotated[str, Field(max_length=255, pattern=r"^https?://[^\s]+$")]


class ImageInput(Contract):
    url: str = Field(
        min_length=1, max_length=255, pattern=r"^(https?://[^\s]+|/media/[A-Za-z0-9/_.-]+)$"
    )


class AsylumCreate(Contract):
    municipality_id: Id
    name: str = Field(min_length=5, max_length=100)
    description: str = Field(min_length=20, max_length=1000)
    sector: str = Field(min_length=1, max_length=100)
    address: str = Field(min_length=1, max_length=200)
    latitude: Decimal = Field(ge=17, le=20.5, max_digits=9, decimal_places=6)
    longitude: Decimal = Field(ge=-72.5, le=-68, max_digits=9, decimal_places=6)
    total_capacity: int = Field(gt=0, le=100000)
    min_price: Money
    max_price: Money
    entry_requirements: str = Field(min_length=10, max_length=500)
    certifications: str | None = Field(default=None, max_length=250)
    phone: Phone
    email: Email
    website: Web | None = None
    service_ids: list[Id] = Field(min_length=1, max_length=30)
    senior_type_ids: list[Id] = Field(min_length=1, max_length=30)
    images: list[ImageInput] = Field(min_length=1, max_length=15)

    @model_validator(mode="after")
    def validate_ranges(self) -> Self:
        if self.max_price < self.min_price:
            raise ValueError("maxPrice must be at least minPrice")
        if len(set(self.service_ids)) != len(self.service_ids) or len(
            set(self.senior_type_ids)
        ) != len(self.senior_type_ids):
            raise ValueError("Catalog IDs must be distinct")
        return self


class CenterUpdate(Contract):
    description: str | None = Field(default=None, min_length=20, max_length=1000)
    total_capacity: int | None = Field(default=None, gt=0, le=100000)
    min_price: Money | None = None
    max_price: Money | None = None
    entry_requirements: str | None = Field(default=None, min_length=10, max_length=500)
    certifications: str | None = Field(default=None, max_length=250)
    phone: Phone | None = None
    email: Email | None = None
    website: Web | None = None
    service_ids: list[Id] | None = Field(default=None, min_length=1, max_length=30)
    senior_type_ids: list[Id] | None = Field(default=None, min_length=1, max_length=30)


class AsylumUpdate(CenterUpdate):
    municipality_id: Id | None = None
    name: str | None = Field(default=None, min_length=5, max_length=100)
    sector: str | None = Field(default=None, min_length=1, max_length=100)
    address: str | None = Field(default=None, min_length=1, max_length=200)
    latitude: Decimal | None = Field(default=None, ge=17, le=20.5, max_digits=9, decimal_places=6)
    longitude: Decimal | None = Field(
        default=None, ge=-72.5, le=-68, max_digits=9, decimal_places=6
    )


class ManagedAsylum(Contract):
    asylum_id: int
    municipality_id: int
    name: str
    description: str
    sector: str
    address: str
    latitude: float
    longitude: float
    total_capacity: int
    min_price: Decimal
    max_price: Decimal
    entry_requirements: str
    certifications: str | None
    phone: str
    email: str
    website: str | None
    status: Literal["ACTIVE", "INACTIVE"]
    created_at: datetime
    updated_at: datetime
    service_ids: list[int] = Field(default_factory=list)
    senior_type_ids: list[int] = Field(default_factory=list)
    municipality_name: str | None = None
    province_id: int | None = None
    province_name: str | None = None
    administrator: dict[str, object] | None = None


class ManagedImage(Contract):
    image_id: int
    asylum_id: int
    url: str
    is_cover: bool
    created_at: datetime


class CatalogWrite(Contract):
    name: str = Field(min_length=3, max_length=60)
    province_id: Id | None = None
    is_active: bool = True
