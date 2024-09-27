import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

test('index page exists and opens', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByText('Template-Vite-Solid')).toBeVisible();
});

test('index page has no accessibility violations', async ({ page }) => {
	await page.goto('/');
	const results = (await new AxeBuilder({ page }).analyze()).violations;
	expect(results).toEqual([]);
});

test('non-existent page returns 404', async ({ page }) => {
	await page.goto('/thispagedoesnotexist');
	await expect(page.getByText('Page not found')).toBeVisible();
});

test('404 page has no accessibility violations', async ({ page }) => {
	await page.goto('/');
	const results = (await new AxeBuilder({ page }).analyze()).violations;
	expect(results).toEqual([]);
});
