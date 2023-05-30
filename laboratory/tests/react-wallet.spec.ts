import { expect, test } from '@playwright/test'

test('can connect', async ({ page: w3mPage, context, browserName }) => {
  test.skip(
    browserName === 'webkit' && process.platform === 'linux',
    "Webkit on Linux doesn't seem to support clipboard"
  )

  await w3mPage.goto('./ManagedReact')

  const walletPage = await context.newPage()
  const walletPagePromise = walletPage.goto('https://react-wallet.walletconnect.com/walletconnect')

  await expect(w3mPage.getByText('Connect your wallet')).not.toBeVisible()
  await w3mPage.getByText('Connect Wallet').click({ force: true })
  await expect(w3mPage.getByText('Connect your wallet')).toBeVisible()

  /*
   * Chromium needs clipboard permissions granted, but other browsers don't support this (and don't need it):
   * https://github.com/microsoft/playwright/issues/19888
   */
  if (browserName === 'chromium') {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  }
  await w3mPage.locator('w3m-modal-header[title="Connect your wallet"] button').click()

  // Parallelize page loading for test speed
  await walletPagePromise

  const uriField = walletPage.locator('input[type=text][placeholder^="e.g. wc:"]')
  await expect(uriField).toBeVisible()
  await uriField.focus()
  await expect(uriField).toBeFocused()

  // https://github.com/microsoft/playwright/issues/8114#issuecomment-1550404655
  const isMac = process.platform === 'darwin'
  const modifier = isMac ? 'Meta' : 'Control'
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
  await Promise.all(account1Buttons.map(async button => button.click()))

  await expect(w3mPage.getByText('0 ETH')).not.toBeVisible()

  /*
   * Await sessionProposal.locator('button', { hasText: 'Approve' }).click()
   * .click() no longer works on this button for some reason (seems like recent change), so using keyboard instead
   */
  const approveButton = sessionProposal.locator('button', { hasText: 'Approve' })
  await expect(approveButton).toBeVisible()
  await expect(approveButton).toBeEnabled()
  await approveButton.focus()
  await walletPage.keyboard.press('Space')

  await expect(w3mPage.getByText('0 ETH')).toBeVisible()

  await expect(w3mPage.getByText('Connected')).not.toBeVisible()
  await w3mPage.locator('w3m-address-text').click()
  await expect(w3mPage.getByText('Connected')).toBeVisible()

  await w3mPage.locator('w3m-box-button', { hasText: 'Disconnect' }).click()
  await expect(w3mPage.getByText('Connected')).not.toBeVisible()
  await expect(w3mPage.getByText('0 ETH')).not.toBeVisible()
})
