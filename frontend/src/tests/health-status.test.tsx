import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HealthStatus } from "@/features/health";
import { getHealth } from "@/features/health/api/get-health";

vi.mock("@/features/health/api/get-health", () => ({ getHealth: vi.fn() }));

describe("HealthStatus", () => {
  afterEach(() => vi.resetAllMocks());

  it("shows when the FastAPI service is available", async () => {
    vi.mocked(getHealth).mockResolvedValue({ status: "ok" });
    render(<HealthStatus />);

    expect(screen.getByText("Comprobando API")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("API conectada")).toBeInTheDocument());
  });

  it("shows an actionable offline state", async () => {
    vi.mocked(getHealth).mockRejectedValue(new Error("offline"));
    render(<HealthStatus />);

    await waitFor(() => expect(screen.getByText("API no disponible")).toBeInTheDocument());
  });
});
