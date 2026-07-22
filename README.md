# OrangeHRM E2E Test Automation

End-to-end test automation suite built with Playwright, targeting the OrangeHRM demo application.

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
targeting the OrangeHRM demo application. The project was built to deepen UI automation
skills: Page Object Model architecture, authentication strategies for E2E suites, and
designing tests that remain reliable, hermetic, and independent of each other.

---

## Technologies
- JavaScript (ES6+)
- Playwright
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
│   └── admin/
│       └── jobTitles.spec.js
├── pages/
│   ├── LoginPage.js
│   ├── NavigationMenu.js
│   ├── pim/
│   │   ├── PimListPage.js
│   │   └── AddEmployeePage.js
│   └── admin/
│       └── JobTitlesPage.js
├── utils/
│   └── Helper.js
├── global-setup.js
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
cd orangehrm-e2e
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
npx playwright test tests/admin/jobTitles.spec.js
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

- **Single sign-on architecture**: a `globalSetup` script logs in once before the
  suite runs and saves the session via `storageState`, avoiding repeated logins
  across tests and the rate-limiting issues that come with them.

- **Page Object Model**, organized by module (`pages/pim`, `pages/admin`), with a
  consistent locator priority convention: `getByRole` > `getByPlaceholder` > `locator()`.

- **Hermetic test design**: each test creates its own data (e.g. a new Job Title with
  a dynamic name) rather than depending on pre-existing records, and cleans it up
  afterward via a direct API call in `afterEach` — keeping the shared demo environment
  from accumulating leftover test data.

- **Independent verification over UI trust**: after any create action, the test
  confirms the result independently (via API) instead of relying solely on a UI
  success message.

- **CI/CD**: GitHub Actions runs the full suite on every push/PR across Chromium,
  Firefox, and WebKit, with credentials injected via GitHub Secrets.

---

## Key Learnings

**`storageState` provides identity, not navigation.**
Reusing a saved session skips the login flow, but every test still needs to
explicitly navigate (`page.goto()`) to the page it needs — the saved state
doesn't "remember" where you were.

**A `globalSetup` script does not inherit the config's `baseURL`.**
Since it manually launches its own browser instance outside the test runner,
any URL used inside it (including the one passed to `newPage({ baseURL })`)
must be provided explicitly — it won't fall back to the value in
`playwright.config.js`.

**Shared APIs don't always follow uniform REST conventions.**
While building an API-based cleanup helper, we found that the Job Titles
DELETE endpoint doesn't take an ID in the URL — it expects a bulk-delete
payload (`{ ids: [id] }`) in the request body instead. This was only found by
inspecting real network traffic in the browser, not by assuming a "standard" pattern.

**Race conditions should be fixed by waiting for the right event, not a longer timeout.**
An intermittent "toast not visible" failure wasn't fixed by increasing a wait
duration — it was fixed by making `save()` wait for the actual network response
(`page.waitForResponse`) before returning, so the assertion never runs before
the backend has actually responded.

**A shared public demo environment is a real source of test instability.**
Running against `opensource-demo.orangehrmlive.com` means occasional slow
responses are outside our control. Rather than treating every timeout as a
bug, this was confirmed through manual observation, and handled by adjusting
test/navigation timeouts and local retry count — not by silently increasing
arbitrary wait times without understanding why.

---

## Known Limitations

This project runs against a shared, publicly available demo environment
(`opensource-demo.orangehrmlive.com`), not one under our control. Response times
can occasionally be significantly slower than normal, which has caused intermittent
timeouts unrelated to test correctness — confirmed via manual observation (a
genuinely slow login, consistent failures across all three browsers simultaneously
during a slow period). Test and navigation timeouts, along with local retry count,
have been adjusted to tolerate this. In a real production pipeline, this project
would run against a dedicated staging or mock environment instead.

---

## Future Improvements

- Add Edit and Delete test coverage for Job Titles (currently Create only)
- Add negative test scenarios (e.g. duplicate title, empty required field)
- Expand Admin module coverage: User Management (requires a strategy for its
  dependency on existing employee records)
- Add Leave module tests, likely using a hybrid approach — API for fast test
  data setup, UI for the actual test flow
- Integrate Allure reporting
- Refactor the hardcoded `/web/index.php` API prefix into a shared constant
  (currently repeated across `Helper.js` calls)