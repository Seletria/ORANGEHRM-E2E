export async function assertOk(response, context, expectedStatus = null) {
  const status = response.status();
  const isExpected = expectedStatus !== null ? status === expectedStatus : response.ok();

  if (!isExpected) {
    const body = await response.text().catch(() => '<no body>');
    const expectation = expectedStatus !== null ? `status ${expectedStatus}` : 'a 2xx status';
    throw new Error(`${context} failed: expected ${expectation}, got ${status} — ${body}`);
  }
}