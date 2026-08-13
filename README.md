# OrangeHRM E2E Test Automation

End-to-end test automation suite built with Playwright, targeting the OrangeHRM public demo application.

---

## Contents
- [Why and What](#why-and-what)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Features](#features)
- [Key Learnings](#key-learnings)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)

---

## Why and What

This repository contains an end-to-end test automation suite built with Playwright,
targeting the OrangeHRM demo application. The project was built to practice
senior-level SDET concerns beyond "make the test pass": hermetic test design,
independent verification of API side effects, defensive utility functions with
explicit failure modes, and maintainable architecture on top of a shared,
unpredictable public demo environment.

---

## Technologies
- JavaScript (ES6+)
- Playwright (UI + API testing)
- Node.js
- GitHub Actions (CI)
- dotenv

---

## Project Structure
```text
orangehrm-e2e/
├── tests/
│   ├── auth/
│   │   └── login.spec.js
│   ├── pim/
│   │   └── addEmployee.spec.js
│   ├── admin/
│   │   └── jobTitles.spec.js
│   └── leave/
│       └── leave.spec.js
├── pages/
│   ├── LoginPage.js
│   ├── NavigationMenu.js
│   ├── pim/
│   │   ├── PimListPage.js
│   │   └── AddEmployeePage.js
│   ├── admin/
│   │   └── JobTitlesPage.js
│   └── leave/
│       ├── ApplyPage.js
│       └── MyLeavePage.js
├── api/
│   ├── Employee.api.js
│   ├── JobTitles.api.js
│   └── Leave.api.js
├── utils/
│   ├── assert.utils.js
│   └── date.utils.js
├── fixtures/
│   └── auth.js
├── playwright.config.js
└── .env.example
```

---

## Prerequisites
- Node.js 18 or later
- npm

---

## Installation

Clone the repository:
```bash
git clone https://github.com/Seletria/ORANGEHRM-E2E.git
cd ORANGEHRM-E2E
```

Install dependencies:
```bash
npm install
```

Set up environment variables:
```bash
cp .env.example .env
```
Then fill in `.env` with the demo credentials (see `.env.example` for required keys).

---

## Running Tests

Run the complete test suite (all browsers):
```bash
npx playwright test
```

Run a specific test file:
```bash
npx playwright test tests/leave/leave.spec.js
```

Run in headed mode (see the browser):
```bash
npx playwright test --headed
```

View the HTML report after a run:
```bash
npx playwright show-report
```

---

## Features

- **Per-test authentication via fixture** (`fixtures/auth.js`): each test logs in
  fresh through the actual login flow rather than sharing a single cached
  `storageState`. This was a deliberate trade-off away from a single shared
  session — see *Known Limitations* for why.

- **Page Object Model**, organized by module (`pages/pim`, `pages/admin`,
  `pages/leave`), with a consistent locator priority convention:
  `getByRole` > `getByPlaceholder` > `locator()`.

- **API layer split by domain** (`api/Employee.api.js`, `api/JobTitles.api.js`,
  `api/Leave.api.js`), each importing a shared `assertOk` helper
  (`utils/assert.utils.js`) for consistent error reporting on failed API calls.

- **Hermetic test design**: each test establishes its own preconditions via API
  (e.g. dynamic Job Title name, on-demand leave entitlement via
  `ensureLeaveBalance`) and cleans up after itself in `afterEach`, rather than
  depending on — or polluting — shared state in the public demo.

- **Idempotent setup helpers**: `ensureLeaveBalance` computes the current leave
  entitlement via `getLeaveEntitlementSum` and only tops it up by the deficit,
  so re-running the suite doesn't stack up entitlement indefinitely.

- **Independent verification over UI/API trust**: after any mutating action, the
  test confirms the result independently (e.g. a follow-up `GET`) instead of
  relying solely on `success: true` or a UI toast.

- **Network-synchronized assertions**: UI actions that trigger a backend call
  (e.g. cancelling a leave request) are synchronized with `page.waitForResponse`
  registered via `Promise.all` before the triggering action — not arbitrary
  `waitForTimeout` delays.

- **Runtime-resolved date formatting**: `isoToUiDate` reads the date format
  placeholder from the live DOM per input field at test time, since the shared
  demo's global date format setting can change unpredictably and isn't
  guaranteed to be identical across page regions.

- **Defensive utility functions**: `getRandomWorkdayIsoDate` validates its
  offset range and throws a descriptive error rather than silently returning an
  invalid (past) date when the leave period is close to ending — caught via
  targeted reproduction before being fixed.

- **CI/CD**: GitHub Actions runs the full suite on every push/PR across
  Chromium, Firefox, and WebKit, with credentials injected via GitHub Secrets.

---

## Key Learnings

**Reproduce before you fix.**
A suspected bug in `getRandomWorkdayIsoDate` (silently producing past dates
when the leave period was close to ending) was proven with a throwaway,
non-production debug script before any production code was touched — to
understand the actual failure mode rather than guess at a fix.

**Two DOM regions behaving the same requires explicit confirmation.**
An earlier assumption that the Apply Leave page and My Leave page shared the
same date format setting turned out to be false in practice. Format is now
read from the DOM per input field at runtime instead of assumed shared.

**`success: true` proves nothing.**
Mutating API calls (leave entitlement creation, employee creation) are
followed by an independent `GET` to confirm the change actually persisted,
rather than trusting the response body of the write itself.

**Idempotency means consistent server state, not identical responses.**
`ensureLeaveBalance` can be called any number of times without ever
over-provisioning leave balance — it computes the current sum first and only
adds the deficit.

**Coupling determines file placement, not call count.**
Domain-aware functions (e.g. anything requiring knowledge of leave entitlement
shape) live next to the module they serve (`api/Leave.api.js`), not in a
generic `utils/` bucket, even when called from multiple tests.

**Per-test login trades speed for isolation — and that trade-off has a cost.**
Moving from a single shared `storageState` (set up once via `global-setup.js`)
to a fresh login per test fixed session-expiry flakiness, but increases login
frequency against a shared public demo, which carries real bot-detection /
rate-limiting risk. This is a known, accepted trade-off — not an oversight.

**`waitForResponse` over `waitForTimeout`, registered before the triggering action.**
Network synchronization must listen for a specific response, and the listener
must be set up via `Promise.all` before the action that triggers it — not
after — to avoid a race condition where the response arrives before the
listener exists.

---

## Known Limitations

This project runs against a shared, publicly available demo environment
(`opensource-demo.orangehrmlive.com`), not one under our control:

- Response times can occasionally be significantly slower than normal,
  causing intermittent timeouts unrelated to test correctness.
- The global date format setting can be changed by other users of the demo at
  any time, which is why date formatting is resolved at runtime rather than
  hardcoded.
- Per-test fresh login increases authentication frequency against a shared
  instance, which carries a real (if currently unconfirmed) bot-detection
  risk — a trade-off accepted in exchange for eliminating session-expiry
  flakiness.
- A currently open, unconfirmed flaky failure exists in the Cancel Leave test
  (~2.5% failure rate across a 120-run stability check: 3/120, all browsers),
  surfaced as a `400 - No Working Days Selected` error from the leave request
  creation API. Root cause is under investigation; leading hypothesis is a
  mismatch between `isWeekend()`'s Saturday/Sunday-only check and days marked
  as public holidays in the demo's own calendar — not yet confirmed via trace
  inspection.

In a real production pipeline, this project would run against a dedicated
staging or mock environment instead of a shared public demo.

---

## Future Improvements

- Investigate and resolve the open Cancel Leave flaky failure (see Known
  Limitations)
- Add Leave module Approve/Reject flows and negative test scenarios
- Expand Admin module coverage: User Management (requires a strategy for its
  dependency on existing employee records)
- Refactor the hardcoded `/web/index.php` API prefix into a shared constant
  (currently repeated across every `api/*.js` file)
- Integrate Allure reporting
- Harden the `employeeIdInput` locator in `AddEmployeePage.js`, currently
  fragile