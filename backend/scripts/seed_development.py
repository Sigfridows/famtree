"""Load all eleven fictional development centers without replacing existing data."""

import asyncio
import sys

from scripts.seed_demo import main as seed_demo
from scripts.seed_owner_mock import main as seed_owner_mock


async def main() -> None:
    # Keep demo center IDs stable relative to the original development setup.
    await seed_demo()
    await seed_owner_mock()
    sys.stdout.write("Development seed complete: 11 sample centers (8 demo + 3 owner mock).\n")


if __name__ == "__main__":
    asyncio.run(main())
