from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import Settings, get_settings
from app.core.errors import register_exception_handlers
from app.core.media import ImageStore
from app.core.middleware import RequestIdMiddleware
from app.db.session import DatabaseManager


def create_app(settings: Settings | None = None) -> FastAPI:
    """Build an application instance with explicit configuration."""
    app_settings = settings or get_settings()
    database = DatabaseManager(app_settings.database_url)

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        yield
        await database.dispose()

    app = FastAPI(
        title=app_settings.app_name,
        version="0.2.0",
        docs_url="/docs",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )
    app.state.images = ImageStore(app_settings.upload_dir)
    app.mount(
        "/media", StaticFiles(directory=app_settings.upload_dir, check_dir=False), name="media"
    )
    app.state.settings = app_settings
    app.state.database = database
    app.add_middleware(RequestIdMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=app_settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_exception_handlers(app)
    app.include_router(api_router, prefix=app_settings.api_v1_prefix)
    return app


app = create_app()
