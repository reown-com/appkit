import { describe, expect, it } from 'vitest'
import type { CaipChainId, NetworkControllerClient } from '../../index'
import { NetworkController } from '../../index'

// -- Setup --------------------------------------------------------------------
const caipNetwork = 'eip155:1'
const requestedCaipNetworks = ['eip155:1', 'eip155:2', 'eip155:3'] as CaipChainId[]
const approvedCaipNetworks = ['eip155:1', 'eip155:2'] as CaipChainId[]

const client: NetworkControllerClient = {
  switchCaipNetwork: async _caipNetwork => Promise.resolve()
}

// -- Tests --------------------------------------------------------------------
describe('NetworkController', () => {
  it('should throw if client not set', () => {
    expect(NetworkController._getClient).toThrow('NetworkController client not set')
  })

  it('should have valid default state', () => {
    NetworkController.setClient(client)

    expect(NetworkController.state).toEqual({
      _client: NetworkController._getClient()
    })
  })

  it('should update state correctly on setRequestedCaipNetworks()', () => {
    NetworkController.setRequestedCaipNetworks(requestedCaipNetworks)
    expect(NetworkController.state.requestedCaipNetworks).toEqual(requestedCaipNetworks)
  })

  it('should update state correctly on setApprovedCaipNetworks()', () => {
    NetworkController.setApprovedCaipNetworks(approvedCaipNetworks)
    expect(NetworkController.state.approvedCaipNetworks).toEqual(approvedCaipNetworks)
  })

  it('should update state correctly on switchCaipNetwork()', async () => {
    await NetworkController.switchActiveNetwork(caipNetwork)
    expect(NetworkController.state.caipNetwork).toEqual(caipNetwork)
  })

  it('should update state correctly on setCaipNetwork()', () => {
    NetworkController.setCaipNetwork(caipNetwork)
    expect(NetworkController.state.caipNetwork).toEqual(caipNetwork)
  })
})
