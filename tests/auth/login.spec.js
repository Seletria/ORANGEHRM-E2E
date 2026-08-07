import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";

test.use({ storageState: { cookies: [], origins: [] } });

test('should login successfully with valid credentials', async ({ page }) => {

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);

  await expect(page).toHaveURL(/.*\/dashboard\/index/);
})