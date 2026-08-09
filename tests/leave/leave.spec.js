import { test, expect } from '../../fixtures/auth';
import { ApplyPage } from '../../pages/leave/ApplyPage';
import { ensureLeaveBalance, cancelLeaveRequest, createLeaveRequest, getLeaveTypeIdByName, getRandomLeaveDate } from '../../utils/api/leaveApi';
import { MyLeavePage } from '../../pages/leave/MyLeavePage';

const LEAVE_TYPE_NAME = 'CAN - Bereavement';
const LEAVE_DAYS = 10;

test.describe('Leave Page', () => {
  let applyPage;
  let leaveRequestId;

  test.beforeEach(async ({ page, request }) => {
    applyPage = new ApplyPage(page);
    leaveRequestId = undefined;
    await ensureLeaveBalance(request, process.env.ADMIN_USERNAME, LEAVE_TYPE_NAME, LEAVE_DAYS);
  });

  test.afterEach(async ({ request }) => {
    if (leaveRequestId) {
      await cancelLeaveRequest(request, leaveRequestId);
    }
  });

  test('Should successfully apply for leave with valid dates', async ({ page }) => {
    await applyPage.goto();
    await applyPage.selectLeaveTypeAndFillLeaveDates(LEAVE_TYPE_NAME, '2026-08-26', '2026-08-30');
    leaveRequestId = await applyPage.applyLeave();

    await expect(applyPage.successToast).toBeVisible();
  });

  test('should successfully cancel a pending leave request', async ({ page, request }) => {
    const fromDate = await getRandomLeaveDate(request);
    const toDate = fromDate;

    const leaveTypeId = await getLeaveTypeIdByName(request, LEAVE_TYPE_NAME);
    const createdId = await createLeaveRequest(request, leaveTypeId, fromDate, toDate);
    leaveRequestId = createdId;

    const myLeavePage = new MyLeavePage(page);
    await myLeavePage.goto();
    await myLeavePage.cancelLeaveRequestByDates(fromDate, toDate);

    leaveRequestId = undefined;

    const verifyResponse = await request.get(
      `/web/index.php/api/v2/leave/leave-requests?fromDate=${fromDate}&toDate=${toDate}`
    );
    const verifyBody = await verifyResponse.json();
    const record = verifyBody.data.find(r => r.id === createdId);

    if (!record) {
      throw new Error(`Leave request ${createdId} not found in GET response after cancel`);
    }

    expect(record.leaveBreakdown[0].name).toBe('Cancelled');
  });
})