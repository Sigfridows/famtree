import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import DashboardPage from "@/app/(center-admin)/center-admin/page";

const fixture = vi.hoisted(() => ({ status: "ACTIVE" }));
vi.mock("@/features/center-admin/api/centerAdminService", () => ({ centerAdminService: {
  getMyCenterInfo: vi.fn(async () => ({ name: "Hogar San Francisco de Asís", status: fixture.status, totalCapacity: 40 })),
  getReviews: vi.fn(async () => ({ summary: { average: 0, count: 0 }, items: [] })),
} }));
afterEach(cleanup);

function luminance(rgb: number[]) {
  return rgb.map(channel => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
}
function contrast(a: number[], b: number[]) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

it("scopes readable banner colors without changing other headings", async () => {
  const view = render(<DashboardPage />);
  const heading = await screen.findByRole("heading", { name: "Hogar San Francisco de Asís" });
  expect(heading.closest(".center-dashboard-banner")).not.toBeNull();
  const css = readFileSync(path.join(process.cwd(), "src/app/(center-admin)/center-admin/dashboard-banner.css"), "utf8");
  expect(css).toContain(".admin-app .center-dashboard-banner h1");
  expect(css).toContain("color: #ffffff");
  view.unmount();
});

// Opt-in browser check: component CI does not install Playwright browsers.
it.skipIf(process.env.RUN_BROWSER_CONTRAST_TEST !== "1")("keeps dashboard banner text AA-readable despite global admin heading rules", async () => {
  expect(contrast([118, 118, 118], [255, 255, 255])).toBeCloseTo(4.54, 2);
  const root = process.cwd();
  const read = (file: string) => readFileSync(path.join(root, file), "utf8");
  const utilities = (await postcss([tailwind()]).process(read("src/app/globals.css"), {
    from: path.join(root, "src/app/globals.css"),
  })).css;
  const admin = read("src/app/(system-admin)/system-admin/admin.css").replace(/@import[^;]+;/g, "");
  const bannerPath = path.join(root, "src/app/(center-admin)/center-admin/dashboard-banner.css");
  const banner = existsSync(bannerPath) ? readFileSync(bannerPath, "utf8") : "";
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    for (const status of ["ACTIVE", "INACTIVE"]) {
      fixture.status = status;
      const view = render(<div className="admin-app"><DashboardPage /><h1 id="outside">Outside banner</h1></div>);
      await screen.findByRole("heading", { name: "Hogar San Francisco de Asís" });
      for (const colorScheme of ["light", "dark"] as const) {
        await page.emulateMedia({ colorScheme });
        await page.setViewportSize({ width: colorScheme === "light" ? 1280 : 390, height: 800 });
        // Check both load orders: Next can reorder global CSS between routes.
        for (const css of [utilities + admin + banner, utilities + banner + admin]) {
          await page.setContent(`<style>${css}</style>${view.container.innerHTML}`);
          const samples = await page.evaluate(() => {
            const title = document.querySelector("h1")!;
            const hero = title.parentElement!.parentElement!;
            const texts = [title, title.previousElementSibling!, title.nextElementSibling!, hero.lastElementChild!.lastElementChild!];
            return texts.map(element => {
              const style = getComputedStyle(element);
              // Canvas resolves Tailwind's oklch colors to sRGB, including alpha.
              const canvas = document.createElement("canvas");
              canvas.width = canvas.height = 1;
              const ctx = canvas.getContext("2d")!;
              ctx.fillStyle = style.color;
              ctx.fillRect(0, 0, 1, 1);
              return { text: element.textContent, rgba: Array.from(ctx.getImageData(0, 0, 1, 1).data) };
            });
          });
          // The lighter gradient endpoint is the conservative background for ALL text;
          // opaque badge backgrounds are darker. Alpha text is composited first.
          for (const sample of samples) {
            const bg = [10, 53, 38];
            const alpha = sample.rgba[3] / 255;
            const foreground = sample.rgba.slice(0, 3).map((c, i) => c * alpha + bg[i] * (1 - alpha));
            expect(contrast(foreground, bg), `${status}/${colorScheme}: ${sample.text}`).toBeGreaterThanOrEqual(4.5);
          }
          expect(await page.locator("#outside").evaluate(el => getComputedStyle(el).color)).not.toBe("rgb(255, 255, 255)");
        }
      }
      view.unmount();
    }
  } finally {
    await browser.close();
  }
}, 60000);
