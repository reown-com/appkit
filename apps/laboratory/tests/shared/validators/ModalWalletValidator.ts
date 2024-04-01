import { expect } from '@playwright/test'
import { ModalValidator } from './ModalValidator'

// Each entry corresponds to web3modal${index} email address EOA
const testEmailsEOAAddresses = [
  '0x6DAa039A2bFBb48dE6c02E3333a30856C047D73f',
  '0x804642811117f5063594D0Db0273EA3C1959AE2C',
  '0x871f447Cc32EA3F28Ea09910BE124c451CCcAE4c',
  '0xd3041Dbf9473b9D2f6E15EB1Ca2e5999D3eF9519',
  '0x88dEF109b4877B6fc14c5Fd25ED68B821E270E30',
  '0x465B06679a2a33F3350C9D245872d1e34f10BA9C',
  '0x8cD2c90E98309FcdeEd2bA0FdaC050e0284D1fD6',
  '0x4446d7538f4CF5832604BE20535d954439Ff075d',
  '0xbC6996C993d358989743bC74082B046da9d4d8fb',
  '0x1216ff6012bcFcBaDFb4691cF586702Af9482F8C'
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
