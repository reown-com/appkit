# AppKit HTML Basic E2E Tests

This directory contains end-to-end tests for the HTML AppKit Basic example using Playwright.

## Setup

The test configuration is defined in the root `playwright.config.ts` file. It will:

- Start the dev server on port 3011
- Run tests against Chrome, Firefox, and Safari
- Generate HTML reports for test results

## Running Tests

To run the tests:

```bash
# Run all tests
npm test

# Run tests in headed mode (with visible browser)
npm run test:headed

# Run a specific test file
npx playwright test basic.spec.ts

# Run a specific test
npx playwright test -g "should load the page successfully"
```

## Test Structure

- `basic.spec.ts`: Contains basic tests for the example
- `helpers.ts`: Contains reusable helper functions for tests

## Adding New Tests

When adding new tests, consider:

1. Keep tests independent of each other
2. Use descriptive test names
3. Add helper functions to `helpers.ts` for reusable test logic

## Debugging

To debug tests:
```bash
# Show the browser while running tests
npx playwright test --headed

# Debug with Playwright Inspector
npx playwright test --debug
```