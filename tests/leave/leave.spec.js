import { test, expect } from '@playwright/test';
import { ApplyPage } from '../../pages/leave/ApplyPage';
import { ensureLeaveBalance, cancelLeaveRequest } from '../../utils/Helper';

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
    await applyPage.selectLeaveTypeAndFillLeaveDates(LEAVE_TYPE_NAME, '2026-26-08', '2026-30-08');
    leaveRequestId = await applyPage.applyLeave();

    // const toastHTML = await page.locator('#oxd-toaster_1').innerHTML();
    // console.log('TOAST HTML:', toastHTML);
    await expect(applyPage.successToast).toBeVisible();
  })
})