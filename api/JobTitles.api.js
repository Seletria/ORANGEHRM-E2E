import { assertOk } from '../utils/assert.utils';

export async function getJobTitleIdByName(request, title) {
  const response = await request.get('/web/index.php/api/v2/admin/job-titles');
  await assertOk(response, 'Job title search request');
  const body = await response.json();
  const match = body.data.find(jobTitle => jobTitle.title === title);
  return match ? match.id : null;
}

export async function deleteJobTitleAndExpectStatus(request, id, expectedStatus = 200) {
  const response = await request.delete('/web/index.php/api/v2/admin/job-titles', {
    data: { ids: [id] }
  });
  await assertOk(response, 'Job title delete request', expectedStatus);
  return response;
}

export async function createJobTitleAndExpectStatus(request, title, description = '') {
  const response = await request.post('/web/index.php/api/v2/admin/job-titles', {
    data: { title, description, specification: null, note: '' }
  });
  await assertOk(response, 'Job title creation request');
  const id = await getJobTitleIdByName(request, title);
  return id;
}