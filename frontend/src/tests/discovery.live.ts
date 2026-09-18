// Live HTTP contract checks. Run with scripts/check_discovery.py, not mocked fetch.
import { describe, expect, it } from "vitest";

import { getAsylum, getAsylumCatalogs, getAsylums } from "@/features/asylums";
import { compareAsylums } from "@/features/compare";
import { getAsylumMap } from "@/features/map";

describe("TypeScript adapters against live FastAPI and PostgreSQL", () => {
  it("loads filter catalogs and a paginated search", async () => {
    const catalogs = await getAsylumCatalogs();
    expect(catalogs.provinces).toHaveLength(32);
    const all = await getAsylums({ q: "LOS ROBLES" });
    expect(all.items).toHaveLength(1);
    expect(all.items[0].price_min).toBe("10000.00");
    expect(all.items[0].rating).toBe(4);
    const detail = await getAsylum(all.items[0].id);
    const found = await getAsylums({ q: "robles", services: [detail.services[0].id] });
    expect(found.pagination.page_size).toBe(15);
    expect(found.items.map(item => item.id)).toEqual([detail.id]);
  });

  it("loads details, maps and ordered comparisons through the shared transport", async () => {
    const listing = await getAsylums({ sort: "price_asc" });
    expect(listing.items.length).toBeGreaterThanOrEqual(2);
    const ids = listing.items.slice(0, 2).map((item) => item.id).reverse();
    const detail = await getAsylum(ids[1]);
    expect(detail.images[0].is_cover).toBe(true);
    const map = await getAsylumMap({ certified_only: true });
    expect(map.items.map((item) => item.id)).toEqual([ids[1]]);
    const comparison = await compareAsylums(ids);
    expect(comparison.items.map((item) => item.id)).toEqual(ids);
    await expect(compareAsylums([ids[0], ids[0]])).rejects.toMatchObject({
      status: 422, code: "validation_error",
    });
  });
});
