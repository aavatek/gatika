import { expect, test } from "playwright/test";

test("index page exists and opens", async ({ page }) => {
	const response = await page.goto("/");
	expect(response).toBeTruthy();
	expect(response?.status()).toBeLessThan(400);
});

test("index page has title", async ({ page }) => {
	await page.goto("/");
	await expect(page).toHaveTitle(/Gatika/);
});
