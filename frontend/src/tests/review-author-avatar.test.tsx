import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ReviewsPage from "@/app/(main)/review/page";
import { profileService } from "@/features/profile/api/profileService";
import { reviewService } from "@/features/reviews/api/reviewService";
import { env } from "@/config/env";

vi.mock("next/navigation", () => ({useRouter: () => ({push: vi.fn()}), useSearchParams: () => new URLSearchParams("asylumId=3")}));
vi.mock("@/features/auth/hooks/useAuth", () => ({useAuth: () => ({user: null})}));
vi.mock("@/components/shared/HeaderControls", () => ({default: () => null}));
vi.mock("@/features/reviews/components/ReviewComposer", () => ({default: () => null}));
vi.mock("@/features/reviews/components/ReviewActionModal", () => ({default: () => null}));
afterEach(() => {cleanup(); vi.unstubAllGlobals();});

it("resolves uploaded author photos on new and existing reviews without borrowing the viewer session", async () => {
  let picture: string | null = null;
  const reviews: object[] = [];
  vi.stubGlobal("fetch", vi.fn(async (input: string, init?: RequestInit) => {
    const url = new URL(input, "http://localhost");
    let data: unknown;
    if (url.pathname.endsWith("/users/me/picture")) {
      picture = init?.method === "DELETE" ? null : `/uploads/profiles/photo-${reviews.length}.webp`;
      data = {profilePicture: picture};
    } else if (url.pathname.endsWith("/reviews") && init?.method === "POST") {
      const review = {reviewId: 17, asylumId: 3, userId: 8, rating: 5, comment: "Excelente atención del centro", createdAt: "2026-10-01T00:00:00Z", likes: 0};
      reviews.push(review);
      data = {...review, author: {name: "Ana Pérez", picture}};
    } else if (url.pathname.endsWith("/reviews")) {
      data = reviews.map(review => ({...review, author: {name: "Ana Pérez", picture}}));
    } else if (url.pathname.endsWith("/asylums")) {
      data = {items: [{id: 3, name: "Centro Tres"}], pagination: {pages: 1}};
    } else throw new Error(`Unexpected request: ${url.pathname}`);
    return new Response(JSON.stringify(data), {status: 200, headers: {"content-type": "application/json"}});
  }));
  const origin = env.apiBaseUrl.replace(/\/api\/v1\/?$/, "");
  await profileService.uploadAvatar(new File(["photo"], "avatar.png", {type: "image/png"}));
  await reviewService.createReview({asylumId: 3, rating: 5, comment: "Excelente atención del centro"});
  render(<ReviewsPage />);
  await waitFor(() => expect(screen.getByRole("img", {name: "Ana Pérez"})).toHaveAttribute("src", `${origin}/uploads/profiles/photo-0.webp`));
  fireEvent.error(screen.getByRole("img", {name: "Ana Pérez"}));
  expect(screen.getByRole("img", {name: "Avatar de Ana Pérez"})).toHaveTextContent("AP");
  cleanup();
  await profileService.uploadAvatar(new File(["replacement"], "avatar.png", {type: "image/png"}));
  render(<ReviewsPage />);
  await waitFor(() => expect(screen.getByRole("img", {name: "Ana Pérez"})).toHaveAttribute("src", `${origin}/uploads/profiles/photo-1.webp`));
  cleanup();
  await profileService.removeAvatar();
  render(<ReviewsPage />);
  await waitFor(() => expect(screen.getByRole("img", {name: "Avatar de Ana Pérez"})).toHaveTextContent("AP"));
});
