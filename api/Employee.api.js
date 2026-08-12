import { assertOk } from '../utils/assert.utils';

export async function deleteEmployeeAndExpectStatus(request, empNumber, expectedStatus = 200) {
  const response = await request.delete('/web/index.php/api/v2/pim/employees', {
    data: { ids: [empNumber] }
  });
  await assertOk(response, 'Employee delete request', expectedStatus);
  return response;
}