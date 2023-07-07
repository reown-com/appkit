import { describe, expect, it } from 'vitest'
import type { CaipChainId, NetworkControllerClient } from '../../index'
import { NetworkController } from '../../index'

// -- Setup --------------------------------------------------------------------
const network = 'eip155:1'
const requestedNetworks = ['eip155:1', 'eip155:2', 'eip155:3'] as CaipChainId[]
const approvedNetworks = ['eip155:1', 'eip155:2'] as CaipChainId[]

const client: NetworkControllerClient = {
  getActiveNetwork: async () => Promise.resolve(network),
  getRequestedNetworks: async () => Promise.resolve(requestedNetworks),
  getApprovedNetworks: async () => Promise.resolve(approvedNetworks),
  switchActiveNetwork: async _network => Promise.resolve()
}

// -- Tests --------------------------------------------------------------------
describe('ModalController', () => {
  it('should throw if client not set', () => {
    expect(NetworkController._getClient).toThrow('NetworkController client not set')
  })

  it('should have valid default state', () => {
    NetworkController.setClient(client)

    expect(NetworkController.state).toEqual({
      _client: NetworkController._getClient()
    })
  })

  it('should update state correctly on getRequestedNetworks()', async () => {
    await NetworkController.getRequestedNetworks()
    expect(NetworkController.state.requestedNetworks).toEqual(requestedNetworks)
  })

  it('should update state correctly on getApprovedNetworks()', async () => {
    await NetworkController.getApprovedNetworks()
    expect(NetworkController.state.approvedNetworks).toEqual(approvedNetworks)
  })

  it('should update state correctly on switchNetwork()', async () => {
    await NetworkController.switchActiveNetwork(network)
    expect(NetworkController.state.network).toEqual(network)
  })

  it('should update state correctly on getNetwork()', async () => {
    await NetworkController.getNetwork()
    expect(NetworkController.state.network).toEqual(network)
  })

  it('should update state correctly on setActiveNetwork()', () => {
    NetworkController.setNetwork('eip155:2')
    expect(NetworkController.state.network).toEqual('eip155:2')
  })
})
