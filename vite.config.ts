/// <reference types="vitest" />

import { browserslistToTargets } from 'lightningcss';
import { defineConfig } from 'vite';
import { default as stylex } from '@stylexjs/babel-plugin';
import { default as uno } from 'unocss/vite';
import { default as solid } from 'vite-plugin-solid';
import { default as path } from 'node:path';
import { default as browserslist } from 'browserslist';

export default defineConfig({
	plugins: [
		uno(),
		solid({
			babel: {
				plugins: [[stylex, { dev: true }]],
			},
		}),
	],

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
		environment: 'jsdom',
		include: ['src/**/*.test.{ts,tsx}'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'text-summary'],
			exclude: ['src/app.tsx', 'src/routes/*'],
			include: ['src/**/*.ts', 'src/**/*.tsx'],
		},
		testTimeout: 1000,
	},
	resolve: {
		alias: {
			'@root': path.resolve(__dirname, '.'),
			'@lib': path.resolve(__dirname, './src/lib'),
			'@routes': path.resolve(__dirname, './src/routes'),
			'@features': path.resolve(__dirname, './src/features'),
			'@components': path.resolve(__dirname, './src/components'),
		},
	},
});
