export class NavigationMenu {
  constructor(page) {
    this.page = page;
    this.pimLink = page.getByRole('link', { name: 'PIM' });
  }

  async gotoPIM() {
    await this.pimLink.click();

  }
}