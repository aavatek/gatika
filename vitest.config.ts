import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [solid()],
	test: {
		environment: "node",
		setupFiles: ["./vitest.setup.ts"],
		browser: {
			enabled: true,
			headless: true,
			name: "chromium",
			provider: "playwright",
		},

		// bun test:unit looks for tests based on this
		include: ["src/**/*.{test,spec}.{ts,mts,cts,tsx}"],
	},
});
