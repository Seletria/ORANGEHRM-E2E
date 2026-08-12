import { test, expect } from '../../fixtures/auth';
import { NavigationMenu } from '../../pages/NavigationMenu';
import { PimListPage } from '../../pages/pim/PimListPage';
import { AddEmployeePage } from '../../pages/pim/AddEmployeePage';
import { deleteEmployeeAndExpectStatus } from '../../api/Employee.api';

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