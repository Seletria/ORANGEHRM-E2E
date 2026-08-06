import { isoToUiDate } from '../../utils/dateHelpers';
import { expect } from '@playwright/test';

export class MyLeavePage {
  constructor(page) {
    this.page = page;
    this.fromDateFilter = page
      .locator('.oxd-input-group')
      .filter({ hasText: 'From Date' })
      .locator('input');
  }

  async #buildDateRangeText(fromDate, toDate) {
    const placeholder = await this.fromDateFilter.getAttribute('placeholder');
    const uiFromDate = isoToUiDate(fromDate, placeholder);

    if (fromDate === toDate) {
      return uiFromDate;
    }
    const uiToDate = isoToUiDate(toDate, placeholder);
    const dateText = `${uiFromDate} to ${uiToDate}`;
    return dateText;
  }

  async goto() {
    await this.page.goto('/web/index.php/leave/viewMyLeaveList');
  }

  async cancelLeaveRequestByDates(fromDate, toDate) {
    const dateText = await this.#buildDateRangeText(fromDate, toDate);

    const row = this.page.locator('.oxd-table-card').filter({ hasText: dateText }).filter({ hasNotText: 'Cancelled' }).first();
    await expect(row).toBeVisible();

    const cancelButton = row.getByRole('button', { name: 'Cancel' });

    await cancelButton.click();

    await this.page.waitForTimeout(5000);
  }
}