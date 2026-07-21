import { expect } from "@playwright/test";

export async function getJobTitleIdByName(request, title) {
  const response = await request.get('/web/index.php/api/v2/admin/job-titles');
  const body = await response.json();
  const match = body.data.find(jobTitle => jobTitle.title === title);
  return match ? match.id : null;

}

export async function deleteJobTitleAndExpectStatus(request, id, expectedStatus = 200) {
  const response = await request.delete('/web/index.php/api/v2/admin/job-titles', {
    data: { ids: [id] }
  })
  expect(response.status()).toBe(expectedStatus);
  return response;
}