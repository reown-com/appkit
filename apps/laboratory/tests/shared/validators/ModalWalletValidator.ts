import { expect } from '@playwright/test'
import { ModalValidator } from './ModalValidator'
import { createPublicClient, http } from 'viem'

function getTransport({ chainId }: { chainId: number }) {
  const RPC_URL = 'https://rpc.walletconnect.com'

  return http(
    `${RPC_URL}/v1/?chainId=eip155:${chainId}&projectId=${process.env['NEXT_PUBLIC_PROJECT_ID']}`
  )
}

export const EOA = 'EOA'
export const SMART_ACCOUNT = 'smart account'

type AccountType = typeof EOA | typeof SMART_ACCOUNT

export class ModalWalletValidator extends ModalValidator {
  async expectActivateSmartAccountPromoVisible(visible: boolean) {
    const promo = this.page.getByTestId('activate-smart-account-promo')
    if (visible) {
      await expect(promo, 'Activate smart account promo should be present').toBeVisible()
    } else {
      await expect(promo, 'Activate smart account promo should not be present').toBeHidden()
    }
  }

  async expectTogglePreferredTypeVisible(visible: boolean) {
    const toggle = this.page.getByTestId('account-toggle-preferred-account-type')
    if (visible) {
      await expect(toggle, 'Smart account toggle should be present').toBeVisible()
    } else {
      await expect(toggle, 'Smart account toggle should not be present').toBeHidden()
    }
  }

  async expectChangePreferredAccountToShow(type: AccountType) {
    await expect(
      this.page.getByTestId('account-toggle-preferred-account-type'),
      'Preferred account toggle should show correct value'
    ).toContainText(type)
  }

  async expectAddress(expectedAddress: string) {
    const address = this.page.getByTestId('w3m-address')

    await expect(address, 'Correct address should be present').toHaveText(expectedAddress)
  }

  override async expectSwitchedNetwork(network: string) {
    const switchNetworkButton = this.page.getByTestId('account-switch-network-button')
    await expect(switchNetworkButton).toBeVisible()
    await expect(switchNetworkButton, `Switched network should include ${network}`).toContainText(
      network
    )
  }

  async expectValid6492Signature(
    signature: `0x${string}`,
    address: `0x${string}`,
    chainId: number
  ) {
    const publicClient = createPublicClient({
      transport: getTransport({ chainId })
    })
    const isVerified = await publicClient.verifyMessage({
      message: 'Hello Web3Modal!',
      address,
      signature
    })

    expect(isVerified).toBe(true)
  }
}
