import { test, expect } from '../../fixtures/auth.js';
import { NavigationMenu } from '../../pages/NavigationMenu.js';
import { PimListPage } from '../../pages/pim/PimListPage.js';
import { AddEmployeePage } from '../../pages/pim/AddEmployeePage.js';
import { deleteEmployeeAndExpectStatus } from '../../api/Employee.api.js';

test.describe('Add Employee', () => {
  let empNumber;

  test.beforeEach(() => {
    empNumber = undefined;
  });

  test.afterEach(async ({ request }) => {
    if (empNumber) {
      await deleteEmployeeAndExpectStatus(request, empNumber);
    }
  });

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
    empNumber = await addEmployeePage.getCreatedEmpNumber();
    await expect(page).toHaveURL(/.*viewPersonalDetails\/empNumber\/\d+/);

  })
})