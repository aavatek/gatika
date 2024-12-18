import { expect, test } from 'playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/projects');
	await page.fill('label:has-text("Projektin nimi")', 'Projekti X');
	await page.click('button:has-text("Luo")');
	await page.getByText('Projekti X').click();

	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä 1');
	const startDate1 = new Date();
	const endDate1 = new Date(startDate1);
	endDate1.setDate(startDate1.getDate() + 5);
	const formattedStartDate1 = startDate1.toISOString().split('T')[0];
	const formattedEndDate1 = endDate1.toISOString().split('T')[0];
	await page.fill('[name="start"]', formattedStartDate1);
	await page.fill('[name="end"]', formattedEndDate1);
	await page.click('button:has-text("Luo tehtävä")');

	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä 2');
	const startDate2 = new Date(endDate1);
	startDate2.setDate(endDate1.getDate() + 1);
	const endDate2 = new Date(startDate2);
	endDate2.setDate(startDate2.getDate() + 3);
	const formattedStartDate2 = startDate2.toISOString().split('T')[0];
	const formattedEndDate2 = endDate2.toISOString().split('T')[0];
	await page.fill('[name="start"]', formattedStartDate2);
	await page.fill('[name="end"]', formattedEndDate2);
	await page.click('button:has-text("Luo tehtävä")');

	await page.goto('/gantt');
});

test('Check the dropdown menu default and project selection', async ({
	page,
}) => {
	// Create additional project
	await page.goto('/projects');
	await page.fill('label:has-text("Projektin nimi")', 'Projekti Y');
	await page.click('button:has-text("Luo")');
	await page.getByText('Projekti Y').click();

	await page.getByRole('textbox', { name: 'Tehtävän nimi' }).fill('Tehtävä 1');
	const startDate1 = new Date();
	const endDate1 = new Date(startDate1);
	endDate1.setDate(startDate1.getDate() + 5);
	const formattedStartDate1 = startDate1.toISOString().split('T')[0];
	const formattedEndDate1 = endDate1.toISOString().split('T')[0];
	await page.fill('[name="start"]', formattedStartDate1);
	await page.fill('[name="end"]', formattedEndDate1);
	await page.click('button:has-text("Luo tehtävä")');
	await page.goto('/gantt');

	await expect(page.locator('h1')).toHaveText('Gantt');
	await expect(page.locator('select')).toHaveValue('');
	await page.locator('select').selectOption('Projekti X');

	await expect(page.getByText('Projekti Y')).not.toBeVisible();
	await expect(page.getByText('Tehtävä 1')).toBeVisible();
	await expect(page.getByText('Tehtävä 2')).toBeVisible();

	await page.locator('select').selectOption('Projekti Y');
	await expect(page.getByText('Tehtävä 2')).not.toBeVisible();
});

test('Change starting date of a task from form', async ({ page }) => {
	const dateChange = new Date();
	dateChange.setDate(dateChange.getDate() - 2);
	const formattedDate = dateChange.toISOString().split('T')[0];

	await page.getByText('Tehtävä 1').dblclick();

	// Change the start date of the task
	await page.fill('[name="start"]', formattedDate);
	await page.getByRole('button', { name: 'Tallenna' }).click();
	expect(page.getByText('Tehtävä tallennettu onnistuneesti'));

	await page.getByText('Tehtävä 1').dblclick();

	await expect(page.locator('[name="start"]')).toHaveValue(formattedDate);
});

test('Change ending date of a task from form', async ({ page }) => {
	const dateChange = new Date();
	dateChange.setDate(dateChange.getDate() + 2);
	const formattedDate = dateChange.toISOString().split('T')[0];

	await page.getByText('Tehtävä 1').dblclick();

	// Change the end date of the task
	await page.fill('[name="end"]', formattedDate);
	await page.getByRole('button', { name: 'Tallenna' }).click();
	expect(page.getByText('Tehtävä tallennettu onnistuneesti'));

	await page.getByText('Tehtävä 1').dblclick();

	await expect(page.locator('[name="end"]')).toHaveValue(formattedDate);
});

test('Delete starting date of a task', async ({ page }) => {
	await page.getByText('Tehtävä 1').dblclick();

	// Delete start and end dates
	await page.fill('[name="start"]', '');
	await page.getByRole('button', { name: 'Tallenna' }).click();
	expect(page.getByText('Tehtävä tallennettu onnistuneesti'));

	await page.getByText('Tehtävä 1').dblclick();

	await expect(page.locator('[name="start"]')).toHaveValue('');
});

test('Delete ending date of a task', async ({ page }) => {
	await page.getByText('Tehtävä 1').dblclick();

	// Delete start and end dates
	await page.fill('[name="end"]', '');
	await page.getByRole('button', { name: 'Tallenna' }).click();
	expect(page.getByText('Tehtävä tallennettu onnistuneesti'));

	await page.getByText('Tehtävä 1').dblclick();

	await expect(page.locator('[name="end"]')).toHaveValue('');
});
