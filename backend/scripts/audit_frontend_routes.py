"""Read-only audit of literal apiClient calls; not a browser or payload validator.

Run from backend: .venv/bin/python -m scripts.audit_frontend_routes
Exit 1 means a missing backend route. Exit 2 means no direct calls were found.
"""

import json
import re
import sys
from pathlib import Path
from typing import Any

from app.main import create_app

CALL = re.compile(
    r"apiClient\.(get|post|put|patch|delete)\s*(?:<[^;]*?>)?\s*\(\s*"
    r"(?P<quote>['\"`])(?P<path>[^'\"`]+)(?P=quote)",
    re.DOTALL,
)


def scan(source: str) -> list[tuple[str, str, int]]:
    return [
        (match[1].upper(), match["path"], source.count("\n", 0, match.start()) + 1)
        for match in CALL.finditer(source)
        if match["path"].startswith("/")
    ]


def matches(
    route_path: str, method: str, operations: dict[str, Any], path: str, prefix: str
) -> bool:
    example = re.sub(r"\$\{[^}]+\}", "1", path).split("?", 1)[0]
    pattern = re.sub(r"\{[^}]+\}", "[^/]+", route_path)
    return method.lower() in operations and re.fullmatch(pattern, prefix + example) is not None


def main() -> int:
    app = create_app()
    root = Path(__file__).resolve().parents[2]
    routes = app.openapi()["paths"]
    results = []
    for file in sorted((root / "frontend/src").rglob("*.ts*")):
        if "tests" in file.parts or "__tests__" in file.parts or ".test." in file.name:
            continue
        for method, path, line in scan(file.read_text()):
            matching = [
                operations[method.lower()]
                for route_path, operations in routes.items()
                if matches(route_path, method, operations, path, app.state.settings.api_v1_prefix)
            ]
            results.append(
                {
                    "file": str(file.relative_to(root)),
                    "line": line,
                    "method": method,
                    "path": path,
                    "status": "missing"
                    if not matching
                    else "deprecated"
                    if matching[0].get("deprecated", False)
                    else "matched",
                }
            )
    sys.stdout.write(
        json.dumps(
            {
                "scope": (
                    "Literal apiClient calls only; dynamic URLs, apiRequest, "
                    "payloads and UI require separate verification"
                ),
                "calls": results,
                "missing": sum(item["status"] == "missing" for item in results),
            },
            indent=2,
            ensure_ascii=False,
        )
    )
    return 2 if not results else int(any(item["status"] == "missing" for item in results))


if __name__ == "__main__":
    raise SystemExit(main())
