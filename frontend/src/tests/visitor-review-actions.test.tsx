import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import ReviewsPage from "@/app/(main)/review/page";
import AuthenticationPrompt from "@/components/shared/AuthenticationPrompt";

const state = vi.hoisted(() => ({
  user: null as null | {userId: number; firstName: string; lastName: string; role: string},
  push: vi.fn(), toggleLike: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({push: state.push}),
  useSearchParams: () => new URLSearchParams("asylumId=3&asylumName=Residencia+San+Jos%C3%A9"),
}));
vi.mock("@/features/auth/hooks/useAuth", () => ({useAuth: () => ({user: state.user})}));
vi.mock("@/features/reviews/hooks/useReviews", () => ({useReviews: () => ({
  reviews: [{reviewId: 1, userId: 42, asylumId: 3, author: {name: "Alejandro"}, rating: 5, comment: "Buena atención y cuidado.", likes: 2}],
  asylums: [{id: 3, name: "Residencia San José"}], loading: false, error: null,
  pendingLikes: [], toggleLike: state.toggleLike, submitReview: vi.fn(), refetch: vi.fn(),
})}));
vi.mock("@/components/shared/HeaderControls", () => ({default: () => null}));
vi.mock("@/features/reviews/components/ReviewComposer", () => ({default: () => null}));
vi.mock("@/features/reviews/components/ReviewActionModal", () => ({default: ({action}: {action: {mode: string} | null}) => action ? <div>Formulario de {action.mode}</div> : null}));

afterEach(cleanup);
beforeEach(() => {state.user = null; vi.clearAllMocks();});

it("offers Reportar to visitors instead of an empty options menu, then opens the access modal", async () => {
  render(<><ReviewsPage /><AuthenticationPrompt /></>);
  fireEvent.click(screen.getByRole("button", {name: "Opciones de reseña de Alejandro"}));
  fireEvent.click(await screen.findByRole("button", {name: "Reportar"}));
  expect(screen.getByRole("dialog")).toHaveTextContent(/inicia sesión.*reportar/i);
  expect(screen.getByRole("link", {name: "Iniciar sesión"})).toBeVisible();
  expect(state.push).not.toHaveBeenCalled();
  expect(screen.queryByText("Formulario de report")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", {name: "Seguir explorando"}));
  expect(screen.getByText("Buena atención y cuidado.")).toBeInTheDocument();
});

it("opens the access modal for a visitor like without sending a like or navigating", async () => {
  render(<><ReviewsPage /><AuthenticationPrompt /></>);
  fireEvent.click(screen.getByRole("button", {name: "Me gusta la reseña de Alejandro"}));
  await waitFor(() => expect(screen.getByRole("dialog")).toHaveTextContent(/inicia sesión.*me gusta/i));
  expect(state.toggleLike).not.toHaveBeenCalled();
  expect(state.push).not.toHaveBeenCalled();
});

it("does not render an empty options menu for roles without review actions", () => {
  state.user = {userId: 9, firstName: "Ana", lastName: "Pérez", role: "SYSTEM_ADMIN"};
  render(<><ReviewsPage /><AuthenticationPrompt /></>);
  expect(screen.queryByRole("button", {name: "Opciones de reseña de Alejandro"})).not.toBeInTheDocument();
});

it("keeps report and like behavior for registered users", async () => {
  state.user = {userId: 9, firstName: "Ana", lastName: "Pérez", role: "REGISTERED_USER"};
  render(<><ReviewsPage /><AuthenticationPrompt /></>);
  fireEvent.click(screen.getByRole("button", {name: "Me gusta la reseña de Alejandro"}));
  await waitFor(() => expect(state.toggleLike).toHaveBeenCalledWith("1"));
  fireEvent.click(screen.getByRole("button", {name: "Opciones de reseña de Alejandro"}));
  fireEvent.click(await screen.findByRole("button", {name: "Reportar"}));
  expect(screen.getByText("Formulario de report")).toBeInTheDocument();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
