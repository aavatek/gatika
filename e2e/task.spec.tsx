import { expect, test } from 'playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/projects');
	await page.fill('label:has-text("Projektin nimi")', 'Projekti X');
	await page.click('button:has-text("Luo")');
	await page.getByText('Projekti X').click();
});

test('Check the tasks view', async ({ page }) => {
	await expect(page.locator('h1')).toHaveText('Projekti X');
	expect(page.getByText('Kaikki tehtävät'));
	expect(page.getByText('Ei tulevia tehtäviä'));
	expect(page.getByText('Luo Tehtävä'));
});

test('create, edit and remove a task', async ({ page }) => {
	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä X1');
	await page.selectOption('[name="type"]', { label: 'FaultRepair' });
	await page.selectOption('[name="status"]', { label: 'Suunniteltu' });
	await page.click('button:has-text("Luo tehtävä")');

	await page.getByRole('link', { name: 'Tehtävä X1' }).click();
	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä Y1');
	await page.selectOption('[name="type"]', { label: 'InvestmentTask' });
	await page.getByRole('button', { name: 'Tallenna' }).click();
	await expect(page.locator('a', { hasText: 'Tehtävä Y1' })).toBeVisible();

	await page.getByRole('link', { name: 'Tehtävä Y1' }).click();
	await page.click('button:has-text("Poista")');
	await expect(page.getByText('Tehtävä Y1')).not.toBeVisible();
});

test('show error when creating a task without name', async ({ page }) => {
	await page.click('button:has-text("Luo tehtävä")');
	await expect(page.getByText('Anna tehtävälle nimi')).toBeVisible();
});

test('create task with only start date', async ({ page }) => {
	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä 1');
	await page.fill('[name="start"]', '2024-12-01');
	await page.click('button:has-text("Luo tehtävä")');
	await expect(page.locator('a', { hasText: 'Tehtävä 1' })).toBeVisible();
	await expect(page.getByText('01.12.2024')).toBeVisible();
});

test('create task with only end date', async ({ page }) => {
	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä 1');
	await page.fill('[name="end"]', '2025-01-01');
	await page.click('button:has-text("Luo tehtävä")');
	await expect(page.locator('a', { hasText: 'Tehtävä 1' })).toBeVisible();
	await expect(page.getByText('01.01.2025')).toBeVisible();
});

test('create a duplicate task', async ({ page }) => {
	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä 1');
	await page.click('button:has-text("Luo tehtävä")');
	await expect(page.locator('a', { hasText: 'Tehtävä 1' })).toBeVisible();
	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä 1');
	await page.click('button:has-text("Luo tehtävä")');
	await expect(
		page.getByText('Projektissa on jo tehtävä tällä nimellä'),
	).toBeVisible();
});

test('check that index page shows task correctly', async ({ page }) => {
	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä X1');
	const date = new Date();
	const formattedDate = date.toISOString().split('T')[0];
	await page.fill('[name="start"]', formattedDate);
	await page.fill('[name="end"]', formattedDate);
	await page.click('button:has-text("Luo tehtävä")');
	await page.goto('/');
	await expect(page.locator('a', { hasText: 'Tehtävä X1' })).toBeVisible();

	await page.getByText('Tehtävä X1').click();
	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä Y1');
	await page.getByRole('button', { name: 'Tallenna' }).click();
	await expect(page.locator('a', { hasText: 'Tehtävä Y1' })).toBeVisible();
});

// TODO: add test
test.skip('test navigation when using the back button', async () => {});
