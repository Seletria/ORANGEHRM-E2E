import { getRandomWorkdayIsoDate } from "./dateHelpers";

export async function getRandomLeaveDate(request, minOffsetDays = 30) {
  const period = await getCurrentLeavePeriod(request);
  const today = new Date();
  const periodEnd = new Date(period.endDate);
  const maxOffsetDays = Math.floor((periodEnd - today) / (1000 * 60 * 60 * 24)) - 1;

  return getRandomWorkdayIsoDate(minOffsetDays, maxOffsetDays);
}

async function assertOk(response, context, expectedStatus = null) {
  const status = response.status();
  const isExpected = expectedStatus !== null ? status === expectedStatus : response.ok();

  if (!isExpected) {
    const body = await response.text().catch(() => '<no body>');
    const expectation = expectedStatus !== null ? `status ${expectedStatus}` : 'a 2xx status';
    throw new Error(`${context} failed: expected ${expectation}, got ${status} — ${body}`);
  }
}

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

export async function getEmpNumberByUsername(request, username) {
  const response = await request.get(`/web/index.php/api/v2/admin/users?username=${username}`);
  await assertOk(response, 'User search request');

  const body = await response.json();
  if (!body.data || body.data.length === 0) {
    throw new Error(`A user with the username '${username}' was not found.`);
  }
  return body.data[0].employee.empNumber;
}

export async function getLeaveTypeIdByName(request, name) {
  const response = await request.get('/web/index.php/api/v2/leave/leave-types?limit=0');
  await assertOk(response, 'Leave type search request');

  const body = await response.json();
  const leaveType = body.data.find(type => type.name === name);

  if (!leaveType) {
    throw new Error(`A leave type with the name '${name}' was not found.`);
  }

  return leaveType.id;
}

export async function addLeaveEntitlement(request, empNumber, leaveTypeId, entitlement) {
  const period = await getCurrentLeavePeriod(request);

  const response = await request.post('/web/index.php/api/v2/leave/leave-entitlements', {
    data: {
      empNumber,
      leaveTypeId,
      fromDate: period.startDate,
      toDate: period.endDate,
      entitlement: entitlement.toString(),
    }
  });

  await assertOk(response, 'Leave entitlement creation');
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

  await assertOk(response, 'Cancel leave request');
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
  await assertOk(response, 'Leave request creation');

  const body = await response.json();
  return body.data.id;
}

export async function getCurrentLeavePeriod(request) {
  const response = await request.get(`/web/index.php/api/v2/leave/leave-periods`);
  await assertOk(response, 'Leave period fetch');
  const body = await response.json();
  return body.meta.currentLeavePeriod;
}