export class AddEmployeePage {
  constructor(page) {
    this.page = page;
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.middleNameInput = page.getByPlaceholder('Middle Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async fillEmployeeName(firstName, middleName, lastName) {
    await this.firstNameInput.fill(firstName);
    await this.middleNameInput.fill(middleName);
    await this.lastNameInput.fill(lastName);

  }

  async saveEmployeeInformation() {
    await this.saveButton.click();
  }
}