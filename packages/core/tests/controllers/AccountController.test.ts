import { AccountController } from '../../index'
import { describe, it, expect } from 'vitest'

// -- Setup --------------------------------------------------------------------
const address = '0x123'
const balance = '0.100'
const profileName = 'john.eth'
const profileImage = 'https://ipfs.com/0x123.png'

const controller = new AccountController({
  getAddress: async () => Promise.resolve(address),
  getBalance: async () => Promise.resolve(balance),
  getProfileName: async () => Promise.resolve(profileName),
  getProfileImage: async () => Promise.resolve(profileImage)
})

const partialController = new AccountController({
  getAddress: async () => Promise.resolve(address),
  getBalance: async () => Promise.resolve(balance)
})

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  it('should have valid default state', () => {
    expect(controller.state).toEqual({
      address: '',
      balance: ''
    })
  })

  it('should update state correctly on getAddress()', async () => {
    await controller.getAddress()
    expect(controller.state.address).toEqual(address)
  })

  it('should update state correctly on getBalance()', async () => {
    await controller.getBalance()
    expect(controller.state.balance).toEqual(balance)
  })

  it('should update state correctly on getProfileName()', async () => {
    await controller.getProfileName()
    expect(controller.state.profileName).toEqual(profileName)
  })

  it('should update state correctly on getProfileImage()', async () => {
    await controller.getProfileImage()
    expect(controller.state.profileImage).toEqual(profileImage)
  })

  it('should not throw / update state when getProfileName() is undefined', async () => {
    await partialController.getProfileName()
    expect(partialController.state.profileName).toEqual(undefined)
  })

  it('should not throw / update state when getProfileImage() is undefined', async () => {
    await partialController.getProfileImage()
    expect(partialController.state.profileImage).toEqual(undefined)
  })
})
