import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';

export const test = base.extend({
  storageState: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();

    const loginPage = new LoginPage(page);
    await page.goto('/web/index.php/auth/login');
    await loginPage.login(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
    await page.waitForURL(/.*dashboard.*/);

    const state = await context.storageState();
    await context.close();
    await use(state);
  },
});

export { expect };