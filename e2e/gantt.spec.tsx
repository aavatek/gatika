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

test.skip('Check the dropdown menu default and project selection', async ({
	page,
}) => {
	await expect(page.locator('h1')).toHaveText('Gantt');
	await page.waitForSelector('select');
	await expect(page.locator('select')).toHaveValue('');
	await page.click('select');

	await page.selectOption('select', { label: 'Projekti X' });

	//await page.getByText('Projekti X').click();

	//await page.waitForSelector('option[label="Projekti X"]');

	//const projektiXOption = page.locator('option[label="Projekti X"]');

	//await expect(page.locator('option[label="Projekti X"]')).toContainText('Projekti X');

	// Ensure that the "Projekti X" option is visible after the dropdown expands
	//await expect(projektiXOption).toBeVisible();// kokeile muuta

	// Optionally, select the "Projekti X" option if needed for further tests

	await expect(page.locator('option[label="Projekti X"]')).toBeVisible();

	//await expect(page.locator('select')).toHaveText('Projekti X');

	// Verify the dropdown value after selection
	//const selectedValue = await projektiXOption.getAttribute('value');
	//await expect(page.locator('select')).toHaveValue(selectedValue);

	//await expect(page.locator('option[label="Projekti X"]')).toBeVisible();
});

test('Change starting date of a task', async ({ page }) => {
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

test('Change ending date of a task', async ({ page }) => {
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

test.skip('Ensure the Gantt chart displays tasks grouped by project', async ({
	page,
}) => {
	await expect(page.locator('selectfield')).toHaveValue('Kaikki');
	await page.click('selectfield');
	await expect(page.locator('option')).toHaveValue('Projekti X');
	await page.click('option');

	// Verify tasks for "Projekti X" are displayed on the same row with the same color
	const projectTasks = page.locator('.gantt-task-row:has-text("Projekti X")');
	await expect(projectTasks).toHaveCount(1);
	const taskColors = await projectTasks.evaluateAll((tasks) =>
		tasks.map((task) => getComputedStyle(task).backgroundColor),
	);
	expect(new Set(taskColors).size).toBe(1); // All tasks have the same color
});
