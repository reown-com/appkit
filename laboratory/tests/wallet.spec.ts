import { expect, test } from '@playwright/test'

test('can connect wallet', async ({ page: w3mPage, context, browserName }) => {
  await w3mPage.goto('./ManagedReact')

  const walletPage = await context.newPage()
  const walletPagePromise = walletPage.goto('https://react-wallet.walletconnect.com/walletconnect')

  await expect(w3mPage.getByText('Connect your wallet')).not.toBeVisible()
  await w3mPage.getByText('Connect Wallet').click({ force: true })
  await expect(w3mPage.getByText('Connect your wallet')).toBeVisible()

  const isMac = process.platform === 'darwin'
  if (browserName === 'chromium' || !isMac) {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  await w3mPage.locator('w3m-modal-header[title="Connect your wallet"] button').click()

  await walletPagePromise

  const uriField = walletPage.locator('input[type=text][placeholder^="e.g. wc:"]')
  await expect(uriField).toBeVisible()
  await walletPage.waitForTimeout(2000)
  await uriField.focus()
  await expect(uriField).toBeFocused()

  // https://github.com/microsoft/playwright/issues/8114#issuecomment-1550404655
  const modifier = isMac ? 'Meta' : 'Control'
  console.log(`keys ${modifier}+KeyV`)
  await walletPage.keyboard.press(`${modifier}+KeyV`)
  await expect(uriField).toBeFocused()

  const connectButton = uriField.locator('..').getByText('Connect')
  await expect(connectButton).toBeEnabled()
  await connectButton.click()

  const sessionProposal = walletPage.locator('[role=dialog]').filter({
    has: walletPage.locator('h3').filter({ hasText: 'Session Proposal' })
  })
  await expect(sessionProposal).toBeVisible()
  const account1Buttons = await sessionProposal
    .locator('[role=button]')
    .filter({ hasText: 'Account 1' })
    .all()
  for (const button of account1Buttons) {
    await button.click()
  }

  await expect(w3mPage.getByText('0 ETH')).not.toBeVisible()

  // await sessionProposal.locator('button', { hasText: 'Approve' }).click()

  // .click() doesn't work for some reason (seems like recent change), so using keyboard instead
  const approveButton = sessionProposal.locator('button', { hasText: 'Approve' })
  await expect(approveButton).toBeVisible()
  await expect(approveButton).toBeEnabled()
  await approveButton.focus()
  await walletPage.keyboard.press('Space')

  await expect(w3mPage.getByText('0 ETH')).toBeVisible()
})
