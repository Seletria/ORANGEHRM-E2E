export class JobTitlesPage {
  constructor(page) {
    this.page = page;
    this.addJobTitleButton = page.getByRole('button', { name: "Add" });
    this.jobTitleInput = page.locator('.oxd-input-group')
      .filter({ hasText: 'Job Title' })
      .locator('input');
    this.jobDescription = page.getByPlaceholder('Type description here');
    this.saveButton = page.getByRole('button', { name: "Save" });

    this.successToast = page.locator('.oxd-toast--success');
  }

  async goto() {
    await this.page.goto('/web/index.php/admin/viewJobTitleList');
  }

  async openForm() {
    await this.addJobTitleButton.click();
  }

  async fillJobTitleForm(name, description) {
    await this.jobTitleInput.fill(name);
    await this.jobDescription.fill(description);
  }

  async save() {
    await this.saveButton.click();
  }
}