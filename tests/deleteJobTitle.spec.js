import { test, expect } from '@playwright/test';
import { JobTitlesPage } from '../pages/admin/JobTitlesPage';
import { getJobTitleIdByName } from '../utils/Helper';

test.describe('Add and delete job titles', () => {

  test('should create job title via UI and delete it via UI', async ({ page, request }) => {
    const createdTitleName = `QA_Test_${Date.now()}`;

    const jobTitlePage = new JobTitlesPage(page);
    await jobTitlePage.goto();
    await jobTitlePage.openForm();
    await jobTitlePage.fillJobTitleForm(createdTitleName, 'Created for test');
    await jobTitlePage.save();

    await jobTitlePage.deleteJobTitleViaUI(createdTitleName);

    const deletedId = await getJobTitleIdByName(request, createdTitleName);

    expect(deletedId).toBeNull();
  })
})
