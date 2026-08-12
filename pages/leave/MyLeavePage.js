import { isoToUiDate } from '../../utils/date.utils.js';
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
    return `${uiFromDate} to ${uiToDate}`;
  }

  async goto() {
    await this.page.goto('/web/index.php/leave/viewMyLeaveList');
  }

  async cancelLeaveRequestByDates(fromDate, toDate) {
    const dateText = await this.#buildDateRangeText(fromDate, toDate);

    const row = this.page
      .locator('.oxd-table-card')
      .filter({ hasText: dateText })
      .filter({ hasNotText: 'Cancelled' })
      .first();

    await expect(row).toBeVisible();

    const cancelButton = row.getByRole('button', { name: 'Cancel' });
    const [response] = await Promise.all([
      this.page.waitForResponse(res =>
        res.url().includes('/leave-requests/') && res.request().method() === 'PUT'
      ),
      cancelButton.click(),
    ]);

    if (!response.ok()) {
      throw new Error(`Cancel leave request UI action failed: ${response.status()}`);
    }
  }
}