import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test('should login successfully with valid credentials', async ({ page }) => {

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('Admin', 'admin123');

  await expect(page).toHaveURL('/web/index.php/dashboard/index');
})