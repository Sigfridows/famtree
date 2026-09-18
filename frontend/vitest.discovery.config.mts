import { defineConfig, mergeConfig } from "vitest/config";
import base from "./vitest.config.mjs";

export default mergeConfig(base, defineConfig({
  test: { environment: "node", include: ["src/tests/discovery.live.ts"] },
}));
