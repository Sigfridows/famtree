import { afterEach, describe, expect, it, vi } from "vitest";

import { getHealth } from "@/lib/api/health";

describe("getHealth", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("uses the centralized API client health route", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ status: "ok" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(getHealth()).resolves.toEqual({ status: "ok" });
  });
});
