# Functional Tests

We use Playwright as our functional test runner. It's configured to try multiple permutations:

- Browsers: Chromium/Firefox
- Modal flavors: default/SIWE/email

## Running Tests

- `npx playwright test` to run in default mode (make sure your `.env` is set up)
- `npm run playwright:debug` to step by step see what the tests are doing

## Debugging

For scenarios when tests pass locally but not remotely you can `await this.page.screenshot({ path: './screenshots/wallet.png' })` and the screenshot will be uploaded to GitHub Actions.
