import 'dotenv/config';
import { chromium } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

async function globalSetup(config) {
  const baseURL = process.env.BASE_URL;
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });

  const loginPage = new LoginPage(page);
  await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
  await loginPage.login(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);

  await page.waitForURL(/.*dashboard.*/);
  await page.context().storageState({ path: 'storageState.json' });

  await browser.close();
}

export default globalSetup;