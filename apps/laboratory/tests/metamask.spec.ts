import { expect } from '@playwright/test'
import { metaMaskFixtures, testWithSynpress } from '@synthetixio/synpress'
import { ModalValidator } from './shared/validators/ModalValidator'
import basicSetup from './wallet-setup/basic.setup'

// -- Setup --------------------------------------------------------------------
const synpressTest = testWithSynpress(metaMaskFixtures(basicSetup)).extend<{ library: string }>({
  library: ['wagmi', { option: true }]
})

synpressTest.describe.configure({ mode: 'serial' })

synpressTest('should be connected as expected', async ({ page, metamask }) => {
  await page.goto(`/library/wagmi`)
  const modalValidator = new ModalValidator(page)
  await page.getByTestId('connect-button').click()
  const connectMetaMaskButton = page.getByTestId('wallet-selector-io.metamask')
  await expect(connectMetaMaskButton).toBeVisible()
  await connectMetaMaskButton.click()
  await metamask.connectToDapp()
  await modalValidator.expectConnected()
})
