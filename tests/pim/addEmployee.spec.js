// import { test, expect } from '../../fixtures/authFixture';
import { test, expect } from '@playwright/test';
import { NavigationMenu } from '../../pages/NavigationMenu';
import { PimListPage } from '../../pages/pim/PimListPage';
import { AddEmployeePage } from '../../pages/pim/AddEmployeePage';

test('should add new employee successfully', async ({ page }) => {
  const successToast = page.locator('.oxd-text--toast-message');
  await page.goto('/web/index.php/dashboard/index');

  const navigationMenu = new NavigationMenu(page);
  const pimListPage = new PimListPage(page);
  const addEmployeePage = new AddEmployeePage(page);

  await navigationMenu.gotoPIM();
  await pimListPage.clickAddEmployee();
  await addEmployeePage.fillEmployeeInformation();
  await addEmployeePage.saveEmployeeInformation();

  await expect(successToast).toContainText('Successfully Saved');
  await expect(page).toHaveURL(/.*viewPersonalDetails\/empNumber\/\d+/);

})