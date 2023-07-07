import { describe, expect, it } from 'vitest'
import type { CaipChainId, NetworkControllerClient } from '../../index'
import { NetworkController } from '../../index'

// -- Setup --------------------------------------------------------------------
const network = 'eip155:1'
const requestedNetworks = ['eip155:1', 'eip155:2', 'eip155:3'] as CaipChainId[]
const approvedNetworks = ['eip155:1', 'eip155:2'] as CaipChainId[]

const client: NetworkControllerClient = {
  switchNetwork: async _network => Promise.resolve()
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

  it('should update state correctly on setRequestedNetworks()', () => {
    NetworkController.setRequestedNetworks(requestedNetworks)
    expect(NetworkController.state.requestedNetworks).toEqual(requestedNetworks)
  })

  it('should update state correctly on setApprovedNetworks()', () => {
    NetworkController.setApprovedNetworks(approvedNetworks)
    expect(NetworkController.state.approvedNetworks).toEqual(approvedNetworks)
  })

  it('should update state correctly on switchNetwork()', async () => {
    await NetworkController.switchActiveNetwork(network)
    expect(NetworkController.state.network).toEqual(network)
  })

  it('should update state correctly on setNetwork()', () => {
    NetworkController.setNetwork(network)
    expect(NetworkController.state.network).toEqual(network)
  })
})
