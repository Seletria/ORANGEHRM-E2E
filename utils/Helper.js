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

export async function createJobTitleAndExpectStatus(request, title, description = '') {
  const response = await request.post('/web/index.php/api/v2/admin/job-titles', {
    data: { title, description, specification: null, note: '' }
  });

  expect(response.status()).toBe(200);
  const id = await getJobTitleIdByName(request, title);
  return id;
}

export async function getEmpNumberByUsername(request, username) {
  const response = await request.get(`/web/index.php/api/v2/admin/users?username=${username}`);

  if (!response.ok()) {
    throw new Error(`User search request failed: ${response.status()}`)
  };
  const body = await response.json();
  if (!body.data || body.data.length === 0) {
    throw new Error(`A user with the username '${username}' was not found.`);
  }
  return body.data[0].employee.empNumber;
}

export async function getLeaveTypeIdByName(request, name) {
  const response = await request.get('/web/index.php/api/v2/leave/leave-types?limit=0');

  if (!response.ok()) {
    throw new Error(`Leave type search request failed: ${response.status()}`);
  }

  const body = await response.json();
  const leaveType = body.data.find(type => type.name === name);

  if (!leaveType) {
    throw new Error(`A leave type with the name '${name}' was not found.`);
  }

  return leaveType.id;
}

export async function addLeaveEntitlement(request, empNumber, leaveTypeId, entitlement) {
  const currentYear = new Date().getFullYear();

  const response = await request.post('/web/index.php/api/v2/leave/leave-entitlements', {
    data: {
      empNumber,
      leaveTypeId,
      fromDate: `${currentYear}-01-01`,
      toDate: `${currentYear}-12-31`,
      entitlement: entitlement.toString(),
    }
  });

  if (!response.ok()) {
    throw new Error(`Leave entitlement creation failed: ${response.status()}`);
  }
}

export async function ensureLeaveBalance(request, username, leaveTypeName, days) {
  const empNumber = await getEmpNumberByUsername(request, username);
  const leaveTypeId = await getLeaveTypeIdByName(request, leaveTypeName);
  await addLeaveEntitlement(request, empNumber, leaveTypeId, days);
}

export async function cancelLeaveRequest(request, leaveRequestId) {

  const response = await request.put(`/web/index.php/api/v2/leave/employees/leave-requests/${leaveRequestId}`, {
    data: {
      action: 'CANCEL'
    }
  });

  if (!response.ok()) {
    throw new Error(`Cancel leave request failed: ${response.status()}`);
  }
}

export async function createLeaveRequest(request, leaveTypeId, fromDate, toDate) {
  const response = await request.post(`/web/index.php/api/v2/leave/leave-requests`, {
    data: {
      leaveTypeId,
      fromDate,
      toDate,
      comment: null
    }
  });

  if (!response.ok()) {
    throw new Error(`Leave request creation failed: ${response.status()}`);
  }

  const body = await response.json();

  return body.data.id;
}
