import { test, expect } from '@playwright/test';
import { JobTitlesPage } from '../../pages/admin/JobTitlesPage';
import { getJobTitleIdByName, deleteJobTitleAndExpectStatus } from '../../utils/Helper';

test.describe('Job Titles', () => {
  let createdTitleName;

  test.afterEach(async ({ request }) => {
    if (createdTitleName) {
      const id = await getJobTitleIdByName(request, createdTitleName);
      if (id) {
        await deleteJobTitleAndExpectStatus(request, id);
      }
    }
  })

  test('A new job title can be created and verified', async ({ page, request }) => {
    createdTitleName = `QA_Test_${Date.now()}`;

    const jobTitlePage = new JobTitlesPage(page);
    await jobTitlePage.goto();
    await jobTitlePage.openForm();
    await jobTitlePage.fillJobTitleForm(createdTitleName, 'Test icin olusturuldu');
    await jobTitlePage.save();

    await expect(jobTitlePage.successToast).toBeVisible();
    await expect(jobTitlePage.successToast).toContainText('Successfully Saved');

    const id = await getJobTitleIdByName(request, createdTitleName);
    expect(id).not.toBeNull();
  })
})