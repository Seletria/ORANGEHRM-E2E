// global-setup.js
import { chromium } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

async function globalSetup(config) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: 'https://opensource-demo.orangehrmlive.com' });


  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('Admin', 'admin123');

  await page.waitForURL(/.*dashboard.*/);

  await page.context().storageState({ path: 'storageState.json' });

  await browser.close();
}

export default globalSetup;