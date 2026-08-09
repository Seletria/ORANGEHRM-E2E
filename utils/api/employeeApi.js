import { assertOk } from './assertOk';

// NOT: payload formatı ({ ids: [empNumber] }) DevTools'tan henüz doğrulanmadı,
// Job Titles pattern'inden varsayıldı. Kullanmadan önce gerçek request payload'ı
// ile teyit edilmeli.
export async function deleteEmployeeAndExpectStatus(request, empNumber, expectedStatus = 200) {
  const response = await request.delete('/web/index.php/api/v2/pim/employees', {
    data: { ids: [empNumber] }
  });
  await assertOk(response, 'Employee delete request', expectedStatus);
  return response;
}