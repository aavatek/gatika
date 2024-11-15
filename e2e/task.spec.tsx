import { expect, test } from 'playwright/test';

test('Check the tasks view', async ({ page }) => {
	await page.goto('/projects');
	await page.fill('label:has-text("Projektin nimi")', 'Projekti X');
	await page.click('button:has-text("Luo")');
	await page.getByText('Projekti X').click();

	// Check content
	await expect(page.locator('h1')).toHaveText('Projekti X');
	expect(page.getByText('Kaikki tehtävät'));
	expect(page.getByText('Ei tulevia tehtäviä'));
	expect(page.getByText('Luo Tehtävä'));
});

test('create, edit and remove a task', async ({ page }) => {
	// create a project and a task for it
	await page.goto('/projects');
	await page.fill('label:has-text("Projektin nimi")', 'Projekti X');
	await page.click('button:has-text("Luo")');
	await page.getByText('Projekti X').click();

	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä X1');
	await page.selectOption('[name="type"]', { label: 'FaultRepair' });
	await page.selectOption('[name="status"]', { label: 'Suunniteltu' });
	await page.click('button:has-text("Luo tehtävä")');

	// edit the task
	await page.getByText('Tehtävä X1').click();
	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä Y1');
	await page.selectOption('[name="type"]', { label: 'InvestmentTask' });
	await page.getByRole('button', { name: 'Tallenna' }).click();
	await page.getByRole('button', { name: 'Takaisin' }).click();
	await expect(page.locator('a', { hasText: 'Tehtävä Y1' })).toBeVisible();

	// remove a task
	await page.getByText('Tehtävä Y1').click();
	await page.getByRole('button', { name: 'Poista' }).click();
	await expect(page.getByText('Tehtävä Y1')).not.toBeVisible();
});

test('show error when creating a task without name', async ({ page }) => {
	await page.goto('/projects');
	await page.fill('label:has-text("Projektin nimi")', 'Projekti X');
	await page.click('button:has-text("Luo")');
	await page.getByText('Projekti X').click();

	await page.click('button:has-text("Luo tehtävä")');
	await expect(page.getByText('Anna tehtävälle nimi')).toBeVisible();
});

// add more tests
