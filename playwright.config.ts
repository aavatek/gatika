import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: 'e2e',
	reporter: 'list',
	outputDir: '.playwright',
	timeout: 30 * 1000,
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 1 : undefined,
	forbidOnly: !!process.env.CI,

	use: {
		headless: true,
		baseURL: 'http://localhost:3000',
		trace: 'on-first-retry',
		browserName: 'chromium',
	},

	webServer: {
		url: 'http://localhost:3000',
		command: 'bun dev',
		reuseExistingServer: !process.env.CI,
	},
});
