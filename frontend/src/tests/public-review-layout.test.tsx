import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import ReviewsPage from "@/app/(main)/review/page";
import { useReviews } from "@/features/reviews/hooks/useReviews";

const state = vi.hoisted(() => ({query: "asylumId=3&asylumName=Centro+Tres"}));
vi.mock("next/navigation", () => ({useRouter: () => ({push: vi.fn()}), useSearchParams: () => new URLSearchParams(state.query)}));
vi.mock("@/features/auth/hooks/useAuth", () => ({useAuth: () => ({user: null})}));
vi.mock("@/features/reviews/hooks/useReviews", () => ({useReviews: vi.fn(() => ({
  reviews: [{id: 1, asylumId: 3, author: "Ana", rating: 5, comment: "Atención del centro tres", likes: 0}],
  asylums: [{id: 3, name: "Centro Tres"}], loading: false, error: null, pendingLikes: [],
  submitReview: vi.fn(), refetch: vi.fn(), toggleLike: vi.fn(),
}))}));
vi.mock("@/components/shared/HeaderControls", () => ({default: () => null}));
vi.mock("@/features/reviews/components/ReviewComposer", () => ({default: () => null}));
vi.mock("@/features/reviews/components/ReviewActionModal", () => ({default: () => null}));
afterEach(() => {cleanup(); vi.clearAllMocks();});

it.each([
  ["asylumId=3&asylumName=Centro+Tres", "3", "Centro Tres"],
  ["", null, "Sección de Comentarios"],
])("uses the shared reviews layout without an extra ratings summary for %s", (query, centerId, title) => {
  state.query = query;
  render(<ReviewsPage />);
  expect(useReviews).toHaveBeenCalledWith(centerId);
  expect(screen.getByRole("heading", {name: title})).toBeVisible();
  expect(screen.getByText("Atención del centro tres")).toBeInTheDocument();
  expect(screen.queryByRole("region", {name: "Resumen de calificaciones"})).not.toBeInTheDocument();
  expect(screen.queryByRole("heading", {name: /Calificaciones de/})).not.toBeInTheDocument();
  const counts = screen.getByRole("group", {name: "Reseñas por estrellas"});
  expect(counts).toHaveTextContent("5★ 1");
  expect(screen.getByRole("heading", {name: title}).compareDocumentPosition(counts) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
});
