import { AccountController } from '../../index'
import { describe, it, expect } from 'vitest'

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
})
