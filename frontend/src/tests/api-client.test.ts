import { afterEach, describe, expect, it, vi } from "vitest";

import { apiClient, apiRequest } from "@/lib/apiClient";

describe("apiRequest and apiClient", () => {
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

    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(request.body).toBe(JSON.stringify({ name: "example" }));
    expect(new Headers(request.headers).get("content-type")).toBe("application/json");
  });

  it("cleans and formats query parameters", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await apiRequest("/test", {
      params: { a: 1, b: "text", c: [1, 2], d: undefined, e: null, f: "" },
    });

    const [calledUrl] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toContain("a=1");
    expect(calledUrl).toContain("b=text");
    expect(calledUrl).toContain("c=1%2C2");
    expect(calledUrl).not.toContain("d=");
    expect(calledUrl).not.toContain("e=");
    expect(calledUrl).not.toContain("f=");
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

  it("covers apiClient wrapper methods", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ mocked: true }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiClient.get("/test", { params: { q: 1 } })).resolves.toEqual({ data: { mocked: true } });
    await expect(apiClient.post("/test", { foo: "bar" })).resolves.toEqual({ data: { mocked: true } });
    await expect(apiClient.put("/test/1", { foo: "baz" })).resolves.toEqual({ data: { mocked: true } });
    await expect(apiClient.patch("/test/1", { foo: "qux" })).resolves.toEqual({ data: { mocked: true } });
    await expect(apiClient.delete("/test/1")).resolves.toEqual({ data: { mocked: true } });
    expect(fetchMock).toHaveBeenCalledTimes(5);
  });
});