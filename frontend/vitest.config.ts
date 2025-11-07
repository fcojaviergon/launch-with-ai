import path from "node:path"
import { TanStackRouterVite } from "@tanstack/router-vite-plugin"
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vitest/config"

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@domains": path.resolve(__dirname, "./src/domains"),
      "@shared": path.resolve(__dirname, "./src/shared"),
      "@config": path.resolve(__dirname, "./src/config"),
    },
  },
  plugins: [react(), TanStackRouterVite()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mockData",
        "src/routeTree.gen.ts",
      ],
    },
  },
})
