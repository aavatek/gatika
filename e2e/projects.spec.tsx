import { expect, test } from 'playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/projects');
});

test('projects page headers are correct and visible', async ({ page }) => {
	await expect(page.locator('h1')).toHaveText('Projektit');
	expect(page.getByText('Kaikki projektit'));
	expect(page.getByText('Luo Projekti'));
});

test('create, edit and remove a project', async ({ page }) => {
	// create a project
	await page
		.getByRole('textbox', { name: 'Projektin nimi' })
		.fill('Projekti X');
	await page.click('button:has-text("Luo")');
	await expect(page.locator('a', { hasText: 'Projekti X' })).toBeVisible();

	// edit the project
	await page.getByText('Projekti X').click();
	await page.getByRole('link', { name: 'Hallitse' }).click();
	await page
		.getByRole('textbox', { name: 'Projektin nimi' })
		.fill('Projekti Y');
	await page.getByRole('button', { name: 'Tallenna' }).click();
	await expect(page.locator('h1')).toHaveText('Projekti Y');
	await page.getByRole('link', { name: 'Projektit' }).click();
	await expect(page.locator('a', { hasText: 'Projekti Y' })).toBeVisible();

	// check index page for correct name
	await page.goto('/');
	await expect(page.locator('a', { hasText: 'Projekti Y' })).toBeVisible();

	// remove a project
	await page.goto('/projects');
	await page.getByText('Projekti Y').click();
	await page.getByRole('link', { name: 'Hallitse' }).click();
	await page.getByRole('button', { name: 'Poista' }).click();
	await expect(page.getByText('Projekti Y')).not.toBeVisible();
});

test('show error when creating a project without name', async ({ page }) => {
	await page.click('button:has-text("Luo")');
	await expect(page.getByText('Anna projektille nimi')).toBeVisible();
});

test('show error when creating a duplicate project', async ({ page }) => {
	await page
		.getByRole('textbox', { name: 'Projektin nimi' })
		.fill('Projekti X');
	await page.click('button:has-text("Luo")');
	await page
		.getByRole('textbox', { name: 'Projektin nimi' })
		.fill('Projekti X');
	await page.click('button:has-text("Luo")');

	await expect(
		page.getByText('Projekti nimeltä Projekti X on jo olemassa'),
	).toBeVisible();
});

test('test navigation when using the back button', async ({ page }) => {
	// when inspecting project from projects view
	await page.fill('label:has-text("Projektin nimi")', 'Projekti X');
	await page.click('button:has-text("Luo")');
	await page.getByText('Projekti X').click();
	await page.getByRole('button', { name: 'Takaisin' }).click();
	await expect(page).toHaveURL('/projects');

	// when inspecting project from index page
	await page.goto('/');
	await page.getByText('Projekti X').click();
	await page.getByRole('button', { name: 'Takaisin' }).click();
	await expect(page).toHaveURL('/');
});
