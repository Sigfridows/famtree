import { afterEach, describe, expect, it, vi } from "vitest";

import { buildAsylumQuery, getAsylum, getAsylumCatalogs, getAsylums } from "@/features/asylums";
import { compareAsylums } from "@/features/compare";
import { getAsylumMap } from "@/features/map";
import { ApiError } from "@/lib/api/client";

afterEach(() => vi.unstubAllGlobals());

describe("public discovery API adapters", () => {
  it("encodes names safely, joins IDs and preserves zero and false filters", () => {
    const params = new URLSearchParams(buildAsylumQuery({
      q: "Los Róbles & Sol", services: [1, 2], care_types: [], min_price: "0",
      certified_only: false, page: 2, province_id: undefined,
    }).slice(1));
    expect(params.get("q")).toBe("Los Róbles & Sol");
    expect(params.get("services")).toBe("1,2");
    expect(params.get("min_price")).toBe("0");
    expect(params.get("certified_only")).toBe("false");
    expect(params.has("care_types")).toBe(false);
    expect(params.has("province_id")).toBe(false);
    expect(buildAsylumQuery()).toBe("");
  });

  it("uses shared transport, disables stale caching and forwards cancellation to all endpoints", async () => {
    const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ items: [] }), {
      status: 200, headers: { "content-type": "application/json" },
    }));
    vi.stubGlobal("fetch", fetchMock);
    const signal = new AbortController().signal;
    await getAsylums({ q: "robles", page: 2 }, signal);
    await getAsylum(42, signal);
    await getAsylumCatalogs(5, signal);
    await getAsylumMap({ services: [1, 2] }, signal);
    await compareAsylums([7, 3], signal);
    const suffixes = ["/asylums?q=robles&page=2", "/asylums/42", "/asylums/catalogs?province_id=5",
      "/asylums/map?services=1%2C2", "/asylums/compare?ids=7%2C3"];
    fetchMock.mock.calls.forEach(([url, options], index) => {
      expect(String(url).endsWith(suffixes[index])).toBe(true);
      expect(options).toMatchObject({ signal, cache: "no-store", credentials: "include" });
    });
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });

  it("supports default filters and preserves decimal strings and null ratings", async () => {
    const payload = { items: [{ price_min: "10000.00", rating: null }], pagination: { total: 1 } };
    const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify(payload)));
    vi.stubGlobal("fetch", fetchMock);
    expect(await getAsylums()).toEqual(payload);
    await getAsylumMap();
    await getAsylumCatalogs();
    expect(fetchMock.mock.calls.map(([url]) => String(url).split("/api/v1")[1])).toEqual([
      "/asylums", "/asylums/map", "/asylums/catalogs",
    ]);
  });

  it("propagates backend validation and missing-center errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      error: { code: "asylum_not_found", message: "Centro no disponible" },
    }), { status: 404 })));
    await expect(getAsylum(999)).rejects.toMatchObject({ status: 404, code: "asylum_not_found" });
  });

  it("does not convert cancellation into empty search results", async () => {
    const aborted = new DOMException("Aborted", "AbortError");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(aborted));
    await expect(getAsylums()).rejects.toBe(aborted);
    expect(aborted).not.toBeInstanceOf(ApiError);
  });
});
