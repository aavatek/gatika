/// <reference types="vitest" />

import path from 'node:path';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig({
	plugins: [solid()],

	server: {
		port: 3000,
	},

	build: {
		outDir: 'dist',
		target: 'esnext',
		cssMinify: 'lightningcss',
		rollupOptions: {
			cache: true,
		},
	},

	css: {
		transformer: 'lightningcss',
		lightningcss: {
			targets: browserslistToTargets(browserslist('>= 0.25%')),
		},
	},

	test: {
		globals: true,
		isolate: false,
		environment: 'happy-dom',
		include: ['src/**/*.test.{ts,tsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'text-summary'],
			exclude: ['src/app.tsx', 'src/routes/*'],
			include: ['src/**/*.ts', 'src/**/*.tsx'],
		},
	},

	resolve: {
		alias: {
			$src: path.resolve(__dirname, './src'),
			$lib: path.resolve(__dirname, './src/lib'),
			$public: path.resolve(__dirname, './public'),
			$routes: path.resolve(__dirname, './src/routes'),
			$components: path.resolve(__dirname, './src/components'),
		},
	},
});
