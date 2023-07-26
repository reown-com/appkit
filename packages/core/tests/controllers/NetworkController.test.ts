import { describe, expect, it } from 'vitest'
import type { CaipNetwork, NetworkControllerClient } from '../../index'
import { NetworkController } from '../../index'

// -- Setup --------------------------------------------------------------------
const caipNetwork = { id: 'eip155:1', name: 'Ethereum' } as const
const requestedCaipNetworks = [
  { id: 'eip155:1', name: 'Ethereum' },
  { id: 'eip155:42161', name: 'Arbitrum One' },
  { id: 'eip155:43114', name: 'Avalanche C-Chain' }
] as CaipNetwork[]
const approvedCaipNetworks = [
  { id: 'eip155:1', name: 'Ethereum' },
  { id: 'eip155:42161', name: 'Arbitrum One' }
] as CaipNetwork[]

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

  it('should reset state correctly on resetNetwork()', () => {
    NetworkController.resetNetwork()
    expect(NetworkController.state.caipNetwork).toEqual(undefined)
    expect(NetworkController.state.approvedCaipNetworks).toEqual(undefined)
  })
})
