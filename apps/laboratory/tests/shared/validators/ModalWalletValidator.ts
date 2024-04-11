import { expect } from '@playwright/test'
import { ModalValidator } from './ModalValidator'

// Each entry corresponds to web3modal${index} email address EOA
const testEmailsEOAAddresses = [
  '0x629EC1c38cB60E90A47464e166A422256ADd9987',
  '0xc3425Dda0A828983d7D372153B637231b8b53b30',
  '0xa9B505304E0DD13F6C4EaBE21d7a707d620fbce4',
  '0xC1f94ee0cD3dF13866f8fFD2d0907694266C28CE',
  '0xAde4446855699e2aB1bD9D2f57B31A920A7C7bec',
  '0xE66C5Cd1b0B9162D9cb036f7452Ca5C47260757c',
  '0x2221967773371A742C297AD5290c5db0Ed632023',
  '0x72d8d1Cc520d715D8db8E9B34D971F783FdAe634',
  '0x774Ef09E6d93DB7ffE31A836610EDB6202752687',
  '0x3A24983B0527442d8249DE97cFAFabb379c9A938',
  // Non-smart account enabled address
  '0x63e6966E615C3852587d892B57eA6Dae27bac66D'
]

function formatAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-6)}`
}

export class ModalWalletValidator extends ModalValidator {
  async expectActivateSmartAccountPromo() {
    await expect(
      this.page.getByTestId('activate-smart-account-promo'),
      'Activate smart account promo should be present'
    ).toContainText('unauthenticated')
  }

  async expectSmartAccountAddress(index: number) {
    const address = this.page.getByTestId('account-settings-address')

    await expect(address, 'Smart account sepolia address should be present').not.toHaveText(
      formatAddress(testEmailsEOAAddresses[index] || '')
    )
  }

  async expectEoaAddress(index: number) {
    const address = this.page.getByTestId('account-settings-address')

    await expect(address, 'EOA address should be present').toHaveText(
      formatAddress(testEmailsEOAAddresses[index] || '')
    )
  }
}
