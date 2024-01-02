# Debugging

For scenarios when tests pass locally but not remotely you can `await this.page.screenshot({ path: './screenshots/wallet.png' })` and the screenshot will be uploaded to GitHub Actions.
