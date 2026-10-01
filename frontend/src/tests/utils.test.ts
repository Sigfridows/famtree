import { describe, expect, it, vi } from "vitest";
import { cleanPhoneNumber, formatPhoneNumber, getImageUrl } from "@/lib/utils";
vi.mock("@/config/env", () => ({env: {apiBaseUrl: "http://localhost:18000/api/v1"}}));
describe("media URLs", () => {
  it("resolves uploaded files against the backend and preserves external images", () => {
    expect(getImageUrl("/media/photo.jpg")).toBe("http://localhost:18000/media/photo.jpg");
    expect(getImageUrl("media/photo.jpg")).toBe("http://localhost:18000/media/photo.jpg");
    for (const url of ["https://example.com/a.jpg", "http://example.com/a.jpg", "blob:preview"]) expect(getImageUrl(url)).toBe(url);
    expect(getImageUrl(null)).toBe("");
  });
});
describe("phone display", () => {
  it("handles missing, partial, formatted and overlong values", () => {
    expect(cleanPhoneNumber(null)).toBe("");
    expect(cleanPhoneNumber("(809) 555-0101")).toBe("8095550101");
    expect(formatPhoneNumber()).toBe("");
    expect(formatPhoneNumber("80")).toBe("80");
    expect(formatPhoneNumber("80955")).toBe("809-55");
    expect(formatPhoneNumber("809555010199")).toBe("809-555-0101");
  });
});
