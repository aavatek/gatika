import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

test('index page exists and opens', async ({ page }) => {
	const res = await page.goto('/');
	expect(res).toBeTruthy();
	expect(res?.status()).toBeLessThan(400);
});

test('index page has no accessibility violations', async ({ page }) => {
	await page.goto('/');
	const results = (await new AxeBuilder({ page }).analyze()).violations;
	expect(results).toEqual([]);
});

test('non-existent page returns 404', async ({ page }) => {
	const res = await page.goto('/thispagedoesnotexist');
	expect(res).toBeTruthy();
	expect(res?.status()).toBeLessThan(400);
});

test('404 page has no accessibility violations', async ({ page }) => {
	await page.goto('/thispagedoesnotexist');
	const results = (await new AxeBuilder({ page }).analyze()).violations;
	expect(results).toEqual([]);
});
