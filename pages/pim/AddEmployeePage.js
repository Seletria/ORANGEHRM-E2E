export class AddEmployeePage {
  constructor(page) {
    this.page = page;
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.middleNameInput = page.getByPlaceholder('Middle Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.employeeIdInput = page.getByText('Employee Id').locator('..').locator('..').locator('input');
    this.saveButton = page.getByRole('button', { name: 'Save' });
  }

  async fillEmployeeInformation() {
    const randomWord = Array.from({ length: 5 }, () => "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]).join('');
    const randomIdNumber = Date.now().toString().slice(-10);

    await this.firstNameInput.fill(randomWord);
    await this.middleNameInput.fill(randomWord);
    await this.lastNameInput.fill(randomWord);
    await this.employeeIdInput.fill(randomIdNumber);

  }

  async saveEmployeeInformation() {
    await this.saveButton.click();
  }

  async getCreatedEmpNumber() {
    await this.page.waitForURL(/.*viewPersonalDetails\/empNumber\/(\d+)/);
    const match = this.page.url().match(/empNumber\/(\d+)/);
    return match ? match[1] : null;
  }
}