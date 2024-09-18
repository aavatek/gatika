import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: process.env.CI ? 1 : undefined,
	reporter: [["html", { open: "never" }]],

	use: {
		headless: true,
		baseURL: "http://localhost:3000",
		trace: "on-first-retry",
	},

	projects: [
		{
			name: "chromium",
			use: { ...devices["Desktop Chrome"] },
		},
	],

	webServer: {
		command: "bun dev",
		url: "http://localhost:3000",
		timeout: 5000,
		reuseExistingServer: !process.env.CI,
	},
});
