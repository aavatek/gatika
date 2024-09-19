import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";
import { browserConfig } from "./playwright.config";

export default defineConfig({
	plugins: [solid()],
	test: {
		environment: "node",
		setupFiles: ["./vitest.setup.ts"],
		browser: {
			enabled: true,
			headless: browserConfig.headless,
			name: browserConfig.browser,
			provider: "playwright",
			screenshotDirectory: ".vitest/snapshots",
			providerOptions: { ...browserConfig.use },
		},

		// bun test:unit looks for tests based on this
		include: ["src/**/*.{test,spec}.{ts,mts,cts,tsx}"],
	},
});
