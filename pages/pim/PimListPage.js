export class PimListPage {
  constructor(page) {
    this.page = page;
    this.addButton = page.getByRole('button', { name: 'Add' });
  }

  async clickAddEmployee() {
    await this.addButton.click();
  }
}