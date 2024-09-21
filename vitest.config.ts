import solid from 'vite-plugin-solid';
import { defineConfig } from 'vitest/config';
import { browserConfig } from './playwright.config';

export default defineConfig({
	plugins: [solid()],
	test: {
		environment: 'node',
		setupFiles: ['./vitest.setup.ts'],
		browser: {
			enabled: true,
			headless: browserConfig.headless,
			name: browserConfig.browser,
			provider: 'playwright',
			screenshotDirectory: '.vitest/snapshots',
			providerOptions: { ...browserConfig.use },
		},

		coverage: {
			provider: 'v8',
			reporter: ['text', 'json'],
			reportsDirectory: './.vitest/coverage',
			include: ['src/components/**/*', 'src/routes/**/*'],
		},

		include: ['src/**/*.{test,spec}.{ts,mts,cts,tsx}'],
	},
});
