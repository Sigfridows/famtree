from pathlib import Path

import pytest

from app.storage import LocalStorage


def test_local_storage_writes_and_deletes_inside_root(tmp_path: Path) -> None:
    storage = LocalStorage(tmp_path)

    destination = storage.put("asylums/example.txt", b"example")

    assert destination.read_bytes() == b"example"
    storage.delete("asylums/example.txt")
    assert not destination.exists()


def test_local_storage_rejects_path_traversal(tmp_path: Path) -> None:
    storage = LocalStorage(tmp_path)

    with pytest.raises(ValueError, match="inside the configured root"):
        storage.put("../outside.txt", b"unsafe")
