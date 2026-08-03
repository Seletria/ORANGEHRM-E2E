export class MyLeavePage {
  constructor(page) {
    this.page = page;

  }

  #toUiDateFormat(isoDate) {
    const [year, month, day] = isoDate.split('-');
    return `${day}-${month}-${year}`;
  }

  #buildDateRangeText(fromDate, toDate) {
    const uiFromDate = this.#toUiDateFormat(fromDate);

    if (fromDate === toDate) {
      return uiFromDate;
    }
    const uiToDate = this.#toUiDateFormat(toDate);
    return `${uiFromDate} to ${uiToDate}`;
  }

  async goto() {
    await this.page.goto('/web/index.php/leave/viewMyLeaveList');
  }

  async cancelLeaveRequestByDates(fromDate, toDate) {
    const dateText = this.#buildDateRangeText(fromDate, toDate);

    const row = this.page.locator('.card-center').filter({ hasText: dateText });

    const [response] = await Promise.all([
      this.page.waitForResponse(res =>
        res.url().includes('/leave-requests/') && res.request().method() === 'PUT'
      ),
      row.getByRole('button', { name: 'Cancel' }).click(),
    ]);

    if (!response.ok()) {
      throw new Error(`Cancel leave request UI action failed: ${response.status()}`);
    }
  }
}