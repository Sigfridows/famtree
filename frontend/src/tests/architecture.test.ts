import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";

import { describe, expect, it } from "vitest";

const srcRoot = resolve(process.cwd(), "src");
const featureRoot = resolve(srcRoot, "features");
const requiredFeatures = [
  "admin",
  "asylums",
  "auth",
  "center-admin",
  "compare",
  "favorites",
  "health",
  "map",
  "notifications",
  "profile",
  "reports",
  "reviews",
] as const;

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return sourceFiles(path);
    }
    return /\.(ts|tsx)$/.test(entry.name) ? [path] : [];
  });
}

describe("frontend architecture", () => {
  it("keeps every approved Notion feature as an explicit boundary", () => {
    expect(requiredFeatures.filter((feature) => !existsSync(resolve(featureRoot, feature)))).toEqual(
      [],
    );
  });

  it("keeps raw fetch calls inside the shared HTTP transport", () => {
    const transport = resolve(srcRoot, "lib/api/client.ts");
    const offenders = sourceFiles(srcRoot)
      .filter((file) => file !== transport)
      .filter((file) => /\bfetch\s*\(/.test(readFileSync(file, "utf8")))
      .map((file) => relative(srcRoot, file));

    expect(offenders).toEqual([]);
  });
});
