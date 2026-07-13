import { test, expect } from '../../fixtures/authFixture';
import { NavigationMenu } from '../../pages/NavigationMenu';
import { PimListPage } from '../../pages/pim/PimListPage';
import { AddEmployeePage } from '../../pages/pim/AddEmployeePage';

test('should add new employee successfully', async ({ authenticatedPage }) => {
  const navigationMenu = new NavigationMenu(authenticatedPage);
  const pimListPage = new PimListPage(authenticatedPage);
  const addEmployeePage = new AddEmployeePage(authenticatedPage);

  await navigationMenu.gotoPIM();
  await pimListPage.clickAddEmployee();
  await addEmployeePage.fillEmployeeName('ASDasd', 'aaaa', 'asdasda');
  await addEmployeePage.saveEmployeeInformation();

  await expect(authenticatedPage).toHaveURL(/.*viewPersonalDetails\/empNumber\/\d+/);

})