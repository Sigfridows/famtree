import { expect, it } from "vitest";
import { toDetailData } from "@/features/asylums/adapters/detail";
import type { AsylumDetail } from "@/features/asylums/types/asylum.types";

const center: AsylumDetail = {
  id: 7, name: "Centro de prueba", province_id: 1, province_name: "Azua",
  municipality_id: 2, municipality_name: "Azua", sector: "Centro", address: "Calle 1",
  latitude: 18.4, longitude: -70.7, price_min: "15000.00", price_max: "25000.00",
  cover_url: "/cover.jpg", rating: null, review_count: 1,
  description: "Descripción del centro", admission_requirements: "Requisitos de ingreso",
  capacity: 30, certifications: null, phone: "8095550100", email: "centro@example.invalid",
  website: null, images: [], services: [{ id: 1, name: "Enfermería" }], care_types: [],
};

it("preserves location, review eligibility and numeric price ranges in details", () => {
  expect(toDetailData(center)).toMatchObject({
    id: "7", title: center.name, province: "Azua", municipality: "Azua",
    latitude: 18.4, longitude: -70.7, priceMin: 15000, priceMax: 25000,
    rating: null, reviewsCount: 1, capacity: 30, services: center.services,
    images: ["/cover.jpg"], website: undefined,
  });
});

it("uses gallery images before the cover and preserves a registered website", () => {
  const result = toDetailData({ ...center, website: "https://example.invalid",
    images: [{ id: 3, url: "/gallery.jpg", is_cover: false }] });
  expect(result.images).toEqual(["/gallery.jpg"]);
  expect(result.website).toBe("https://example.invalid");
});

it("returns an empty gallery when no public image exists", () => {
  expect(toDetailData({ ...center, cover_url: null }).images).toEqual([]);
});
