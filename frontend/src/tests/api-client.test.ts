import { afterEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "@/lib/api/client";

describe("apiRequest", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("returns typed JSON and includes cookie credentials", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest<{ status: string }>("/health")).resolves.toEqual({ status: "ok" });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/health$/),
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("serializes request bodies as JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ created: true }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/resource", { method: "POST", body: { name: "example" } });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(request.body).toBe(JSON.stringify({ name: "example" }));
    expect(new Headers(request.headers).get("content-type")).toBe("application/json");
  });

  it("normalizes structured API errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { code: "conflict", message: "Already exists" } }), {
          status: 409,
        }),
      ),
    );

    await expect(apiRequest("/failure")).rejects.toEqual(
      expect.objectContaining({
        code: "conflict",
        message: "Already exists",
        name: "ApiError",
        status: 409,
      }),
    );
  });

  it("normalizes non-JSON API errors with a useful fallback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("upstream failure", { status: 502 })));

    await expect(apiRequest("/failure")).rejects.toEqual(
      expect.objectContaining({
        code: "api_error",
        message: "API request failed with status 502",
        status: 502,
      }),
    );
  });

  it("returns undefined for successful responses without content", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(apiRequest<void>("/resource", { method: "DELETE" })).resolves.toBeUndefined();
  });
});
