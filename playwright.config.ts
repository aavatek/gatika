import { defineConfig, devices } from '@playwright/test';

export const browserConfig = {
	browser: 'chromium',
	headless: true,
	use: { ...devices['Desktop Chrome'] },
	url: 'http://localhost:3000',
	viewport: {
		width: 1280,
		height: 720,
	},
};

export default defineConfig({
	testDir: 'e2e',
	outputDir: '.playwright/results',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: 0,
	workers: process.env.CI ? 1 : undefined,

	reporter: [['html', { open: 'never', outputFolder: '.playwright/report' }]],

	use: {
		headless: browserConfig.headless,
		baseURL: browserConfig.url,
		trace: 'on-first-retry',
	},

	projects: [
		{
			name: browserConfig.browser,
			use: browserConfig.use,
		},
	],

	webServer: {
		command: 'bun dev',
		url: browserConfig.url,
		timeout: 20000,
		reuseExistingServer: !process.env.CI,
	},
});
