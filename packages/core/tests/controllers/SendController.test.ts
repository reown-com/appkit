import { describe, expect, it } from 'vitest'
import { SendController } from '../../index.js'

// -- Setup --------------------------------------------------------------------
const token = {
  name: 'Optimism',
  symbol: 'OP',
  chainId: 'eip155:10',
  value: 6.05441523113072,
  price: 4.5340112,
  quantity: {
    decimals: '18',
    numeric: '1.335333100000000000'
  },
  iconUrl: 'https://token-icons.s3.amazonaws.com/0x4200000000000000000000000000000000000042.png'
}
const sendTokenAmount = 0.1
const receiverAddress = '0xd8da6bf26964af9d7eed9e03e53415d37aa96045'
const receiverProfileName = 'john.eth'
const receiverProfileImageUrl = 'https://ipfs.com/0x123.png'

// -- Tests --------------------------------------------------------------------
describe('SendController', () => {
  it('should have valid default state', () => {
    expect(SendController.state).toEqual({})
  })

  it('should update state correctly on setToken()', () => {
    SendController.setToken(token)
    expect(SendController.state.token).toEqual(token)
  })

  it('should update state correctly on setTokenAmount()', () => {
    SendController.setTokenAmount(sendTokenAmount)
    expect(SendController.state.sendTokenAmount).toEqual(sendTokenAmount)
  })

  it('should update state correctly on receiverAddress()', () => {
    SendController.setReceiverAddress(receiverAddress)
    expect(SendController.state.receiverAddress).toEqual(receiverAddress)
  })

  it('should update state correctly on receiverProfileName()', () => {
    SendController.setReceiverProfileName(receiverProfileName)
    expect(SendController.state.receiverProfileName).toEqual(receiverProfileName)
  })

  it('should update state correctly on receiverProfileName()', () => {
    SendController.setReceiverProfileImageUrl(receiverProfileImageUrl)
    expect(SendController.state.receiverProfileImageUrl).toEqual(receiverProfileImageUrl)
  })

  it('should update state correctly on resetSend()', () => {
    SendController.resetSend()
    expect(SendController.state).toEqual({})
  })
})
