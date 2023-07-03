import { describe, expect, it } from 'vitest'
import type { AccountControllerClient } from '../../index'
import { AccountController } from '../../index'

// -- Setup --------------------------------------------------------------------
const address = '0x123'
const balance = '0.100'
const profileName = 'john.eth'
const profileImage = 'https://ipfs.com/0x123.png'

const client: AccountControllerClient = {
  getAddress: async () => Promise.resolve(address),
  getBalance: async _address => Promise.resolve(balance),
  getProfile: async _address => Promise.resolve({ name: profileName, image: profileImage })
}

const partialClient: AccountControllerClient = {
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
    await AccountController.getBalance(AccountController.state.address)
    expect(AccountController.state.balance).toEqual(balance)
  })

  it('should update state correctly on getProfile()', async () => {
    await AccountController.getProfile(AccountController.state.address)
    expect(AccountController.state.profileName).toEqual(profileName)
    expect(AccountController.state.profileImage).toEqual(profileImage)
  })

  it('when optional methods are undefined', async () => {
    AccountController.setClient(partialClient)

    await AccountController.getProfile(AccountController.state.address)
  })
})
