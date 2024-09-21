import AxeBuilder from '@axe-core/playwright';
import { expect, test } from 'playwright/test';

test('has no immediate accessibility issues', async ({ page }) => {
	await page.goto('/');
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});
