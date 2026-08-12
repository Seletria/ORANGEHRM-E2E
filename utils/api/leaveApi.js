import { assertOk } from '../assert.utils';
import { getRandomWorkdayIsoDate } from '../date.utils.js';

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

export async function getCurrentLeavePeriod(request) {
  const response = await request.get(`/web/index.php/api/v2/leave/leave-periods`);
  await assertOk(response, 'Leave period fetch');
  const body = await response.json();
  return body.meta.currentLeavePeriod;
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
  const period = await getCurrentLeavePeriod(request);

  const currentBalance = await getLeaveEntitlementSum(request, leaveTypeId, period.startDate, period.endDate);
  const deficit = days - currentBalance;

  if (deficit > 0) {
    await addLeaveEntitlement(request, empNumber, leaveTypeId, days);
  }
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

export async function getRandomLeaveDate(request, minOffsetDays = 30) {
  const period = await getCurrentLeavePeriod(request);
  const today = new Date();
  const periodEnd = new Date(period.endDate);
  const maxOffsetDays = Math.floor((periodEnd - today) / (1000 * 60 * 60 * 24)) - 1;

  return getRandomWorkdayIsoDate(minOffsetDays, maxOffsetDays);
}

export async function getLeaveEntitlementSum(request, leaveTypeId, fromDate, toDate) {
  const response = await request.get(
    `/web/index.php/api/v2/leave/leave-entitlements?fromDate=${fromDate}&toDate=${toDate}`
  )

  await assertOk(response, 'Leave entitlement fetch');
  const body = await response.json();

  return body.data
    .filter(e => e.leaveType.id === leaveTypeId)
    .reduce((sum, e) => sum + e.entitlement, 0);
}
