import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import RatingSummary from "@/features/asylums/components/RatingSummary";

afterEach(cleanup);

describe("published center ratings", () => {
  it("explains that a center without reviews is not rated zero", () => {
    render(<RatingSummary rating={0} reviewCount={0} />);
    expect(screen.getByText("Sin reseñas")).toBeVisible();
    expect(screen.queryByText("0.0")).not.toBeInTheDocument();
  });

  it("uses an explicit empty-state message in the center detail", () => {
    render(<RatingSummary rating={null} reviewCount={0} emptyLabel="Aún no tiene reseñas" />);
    expect(screen.getByText("Aún no tiene reseñas")).toBeVisible();
    expect(screen.queryByText(/0 reseñas|0\.0/)).not.toBeInTheDocument();
  });

  it.each([1, 2])("withholds the average with %i reviews, even from an older API", count => {
    render(<RatingSummary rating={5} reviewCount={count} />);
    expect(screen.getByText(/mínimo 3/)).toBeVisible();
    expect(screen.queryByText("5.0")).not.toBeInTheDocument();
  });

  it("shows the average from the third review onward", () => {
    render(<RatingSummary rating={4.3} reviewCount={3} />);
    expect(screen.getByText("4.3")).toBeVisible();
    expect(screen.getByLabelText("Calificación: 4.3 de 5, 3 reseñas")).toBeVisible();
  });
});
