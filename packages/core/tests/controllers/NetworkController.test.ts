import { NetworkController } from '../../index'
import { describe, it, expect } from 'vitest'

// -- Setup --------------------------------------------------------------------
const activeNetwork = '1'
const requestedNetworks = ['1', '2', '3']
const approvedNetworks = ['1', '2']

const controller = new NetworkController({
  getActiveNetwork: async () => Promise.resolve(activeNetwork),
  getRequestedNetworks: async () => Promise.resolve(requestedNetworks),
  getApprovedNetworks: async () => Promise.resolve(approvedNetworks),
  switchActiveNetwork: async (network: string) => {
    network.toUpperCase()
    await Promise.resolve()
  }
})

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  it('should have valid default state', () => {
    expect(controller.state).toEqual({
      activeNetwork: '',
      requestedNetworks: [],
      approvedNetworks: []
    })
  })

  it('should update state correctly on getRequestedNetworks()', async () => {
    await controller.getRequestedNetworks()
    expect(controller.state.requestedNetworks).toEqual(requestedNetworks)
  })

  it('should update state correctly on getApprovedNetworks()', async () => {
    await controller.getApprovedNetworks()
    expect(controller.state.approvedNetworks).toEqual(approvedNetworks)
  })

  it('should update state correctly on switchActiveNetwork()', async () => {
    await controller.switchActiveNetwork(activeNetwork)
    expect(controller.state.activeNetwork).toEqual(activeNetwork)
  })

  it('should update state correctly on getActiveNetwork()', async () => {
    await controller.getActiveNetwork()
    expect(controller.state.activeNetwork).toEqual(activeNetwork)
  })
})
