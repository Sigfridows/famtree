import io
from pathlib import Path

import pytest
from PIL import Image

from app.core.errors import AppError
from app.core.media import ImageStore
from app.modules.reports.service import csv_cell


@pytest.mark.parametrize("format_name", ["JPEG", "PNG", "WEBP"])
async def test_image_reencoding_and_owned_deletion(tmp_path: Path, format_name: str) -> None:
    buffer = io.BytesIO()
    Image.new("RGB", (40, 30), "red").save(buffer, format_name)
    store = ImageStore(tmp_path)
    url = await store.save(buffer.getvalue())
    result = tmp_path / url.rsplit("/", 1)[1]
    with Image.open(result) as image:
        assert image.format == "JPEG" and image.size == (40, 30)
    await store.delete("/media/../../outside.jpg")
    assert result.exists()
    await store.delete(url)
    assert not result.exists()


async def test_image_limits_formats_and_profile_rules(tmp_path: Path) -> None:
    store = ImageStore(tmp_path)
    for data in [b"", b"not an image", b"x" * (5 * 1024 * 1024 + 1)]:
        with pytest.raises(AppError):
            await store.save(data)
    buffer = io.BytesIO()
    Image.new("RGB", (2, 2)).save(buffer, "WEBP")
    with pytest.raises(AppError):
        await store.save(buffer.getvalue(), profile=True)
    with pytest.raises(AppError):
        await store.save(b"x" * (2 * 1024 * 1024 + 1), profile=True)
    assert not list(tmp_path.iterdir())


@pytest.mark.parametrize("value", ["=1+1", "+cmd", "-cmd", "@SUM(A1)", "   =1"])
def test_export_does_not_execute_spreadsheet_formulas(value: str) -> None:
    assert csv_cell(value).startswith("'")


def test_csv_preserves_plain_data() -> None:
    assert csv_cell(None) == ""
    assert csv_cell("Centro") == "Centro"
