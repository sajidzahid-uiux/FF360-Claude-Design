import reactPlugin from "@vitejs/plugin-react";
import path from "path";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

/** Prevents org-ui / maplibre CSS from breaking unit tests. */
function stubCssImports(): Plugin {
  return {
    name: "stub-css-imports",
    enforce: "pre",
    load(id) {
      if (id.endsWith(".css")) {
        return "export default {}";
      }
    },
  };
}

export default defineConfig({
  plugins: [stubCssImports(), reactPlugin()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    exclude: ["**/node_modules/**", "**/e2e/**", "**/playwright-report/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "."),
      "@fieldflow360/org-ui": path.resolve(
        import.meta.dirname,
        "lib/__mocks__/org-ui.ts"
      ),
    },
  },
});
