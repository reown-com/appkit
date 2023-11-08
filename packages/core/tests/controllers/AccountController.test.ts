import { describe, expect, it } from 'vitest'
import { AccountController } from '../../index.js'

// -- Setup --------------------------------------------------------------------
const caipAddress = 'eip155:1:0x123'
const balance = '0.100'
const balanceSymbol = 'ETH'
const profileName = 'john.eth'
const profileImage = 'https://ipfs.com/0x123.png'

// -- Tests --------------------------------------------------------------------
describe('AccountController', () => {
  it('should have valid default state', () => {
    expect(AccountController.state.value).toEqual({ isConnected: false })
  })

  it('should update state correctly on setIsConnected()', () => {
    AccountController.setIsConnected(true)
    expect(AccountController.state.value.isConnected).toEqual(true)
  })

  it('should update state correctly on setCaipAddress()', () => {
    AccountController.setCaipAddress(caipAddress)
    expect(AccountController.state.value.caipAddress).toEqual(caipAddress)
    expect(AccountController.state.value.address).toEqual('0x123')
  })

  it('should update state correctly on setBalance()', () => {
    AccountController.setBalance(balance, balanceSymbol)
    expect(AccountController.state.value.balance).toEqual(balance)
    expect(AccountController.state.value.balanceSymbol).toEqual(balanceSymbol)
  })

  it('should update state correctly on setProfileName()', () => {
    AccountController.setProfileName(profileName)
    expect(AccountController.state.value.profileName).toEqual(profileName)
  })

  it('should update state correctly on setProfileImage()', () => {
    AccountController.setProfileImage(profileImage)
    expect(AccountController.state.value.profileImage).toEqual(profileImage)
  })

  it('should update state correctly on resetAccount()', () => {
    AccountController.resetAccount()
    expect(AccountController.state.value).toEqual({ isConnected: false })
  })
})
