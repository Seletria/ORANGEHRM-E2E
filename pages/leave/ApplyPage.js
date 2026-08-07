import { isoToUiDate } from '../../utils/dateHelpers';

export class ApplyPage {

  constructor(page) {
    this.page = page;

    this.leaveTypeDropdown = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'Leave Type' })
      .locator('.oxd-select-text');

    this.fromDatePicker = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'From Date' })
      .locator('input');

    this.toDatePicker = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'To Date' })
      .locator('input');

    this.applyButton = page.getByRole("button", { name: 'Apply' });

    this.successToast = page.locator('.oxd-toast--success');
  }

  async goto() {
    await this.page.goto('/web/index.php/leave/applyLeave');
  }

  async selectLeaveTypeAndFillLeaveDates(leaveTypeName, fromDate, toDate) {
    const placeholder = await this.fromDatePicker.getAttribute('placeholder');
    const uiFromDate = isoToUiDate(fromDate, placeholder);
    const uiToDate = isoToUiDate(toDate, placeholder);

    await this.leaveTypeDropdown.click();
    await this.page.locator('.oxd-select-option').getByText(leaveTypeName, { exact: true }).click();

    await this.fromDatePicker.click();
    await this.fromDatePicker.pressSequentially(uiFromDate);

    await this.toDatePicker.click();
    await this.toDatePicker.fill('');
    await this.toDatePicker.pressSequentially(uiToDate);
  }

  async applyLeave() {
    const [response] = await Promise.all([
      this.page.waitForResponse('**/leave-requests'),
      this.applyButton.click(),
    ]);

    const body = await response.json();
    return body.data.id;
  }
}
