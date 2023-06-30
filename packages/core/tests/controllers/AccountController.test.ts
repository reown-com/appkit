import { AccountController } from '../../index'
import { describe, it, expect } from 'vitest'

// -- Setup --------------------------------------------------------------------
const address = '0x123'
const balance = '0.100'
const profileName = 'john.eth'
const profileImage = 'https://ipfs.com/0x123.png'

const client = {
  getAddress: async () => Promise.resolve(address),
  getBalance: async () => Promise.resolve(balance),
  getProfileName: async () => Promise.resolve(profileName),
  getProfileImage: async () => Promise.resolve(profileImage)
}

const partialClient = {
  getAddress: async () => Promise.resolve(address),
  getBalance: async () => Promise.resolve(balance)
}

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  it('should throw if client not set', () => {
    expect(AccountController._getClient).toThrow('AccountController client not set')
  })

  it('should have valid default state', () => {
    AccountController.setClient(client)

    expect(AccountController.state).toEqual({
      _client: AccountController._getClient(),
      address: '',
      balance: ''
    })
  })

  it('should update state correctly on getAddress()', async () => {
    await AccountController.getAddress()
    expect(AccountController.state.address).toEqual(address)
  })

  it('should update state correctly on getBalance()', async () => {
    await AccountController.getBalance()
    expect(AccountController.state.balance).toEqual(balance)
  })

  it('should update state correctly on getProfileName()', async () => {
    await AccountController.getProfileName()
    expect(AccountController.state.profileName).toEqual(profileName)
  })

  it('should update state correctly on getProfileImage()', async () => {
    await AccountController.getProfileImage()
    expect(AccountController.state.profileImage).toEqual(profileImage)
  })

  it('when optional methods are undefined', async () => {
    AccountController.setClient(partialClient)

    await AccountController.getProfileName()
    await AccountController.getProfileImage()
  })
})
