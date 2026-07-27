import { test, expect } from '@playwright/test';
import { JobTitlesPage } from '../../pages/admin/JobTitlesPage';
import { getJobTitleIdByName, deleteJobTitleAndExpectStatus } from '../../utils/Helper';

test.describe('Job Titles', () => {
  let createdTitleName;
  let jobTitlePage;

  test.beforeEach(async ({ page }) => {
    jobTitlePage = new JobTitlesPage(page);
    await jobTitlePage.goto();
  });

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

    await jobTitlePage.openForm();
    await jobTitlePage.fillJobTitleForm(createdTitleName, 'Test icin olusturuldu');
    await jobTitlePage.save();

    await expect(jobTitlePage.successToast).toBeVisible();
    await expect(jobTitlePage.successToast).toContainText('Successfully Saved');

    const id = await getJobTitleIdByName(request, createdTitleName);
    expect(id).not.toBeNull();
  })

  test('should create job title via UI and delete it via UI', async ({ request }) => {
    createdTitleName = `QA_Test_${Date.now()}`;

    await jobTitlePage.openForm();
    await jobTitlePage.fillJobTitleForm(createdTitleName, 'Created for test');
    await jobTitlePage.save();

    await jobTitlePage.deleteJobTitleViaUI(createdTitleName);

    const deletedId = await getJobTitleIdByName(request, createdTitleName);
    expect(deletedId).toBeNull();
  });

  test('should edit job title via UI and verify via API', async ({ request }) => {
    const originalName = `QA_Test_${Date.now()}`;
    const updatedName = `${originalName}_updated`;

    await jobTitlePage.openForm();
    await jobTitlePage.fillJobTitleForm(originalName, 'Created for edit test');
    await jobTitlePage.save();

    await jobTitlePage.editJobTitleViaUI(originalName, updatedName, 'Updated description');
    createdTitleName = updatedName; // afterEach artık doğru ismi silecek

    const id = await getJobTitleIdByName(request, updatedName);
    expect(id).not.toBeNull();
  });
})