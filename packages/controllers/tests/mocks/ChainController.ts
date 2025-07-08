import { vi } from 'vitest'

import { ChainController, type ConnectionControllerClient } from '../../exports/index.js'

export function mockChainControllerState() {
  ChainController.state.chains = new Map([
    [
      'eip155',
      {
        accountState: {
          currentTab: 0,
          tokenBalance: [],
          smartAccountDeployed: false,
          addressLabels: new Map(),
          user: undefined
        },
        connectionControllerClient: {
          disconnect: vi.fn()
        } as unknown as ConnectionControllerClient
      }
    ]
  ])
  ChainController.state.activeChain = 'eip155'
}

export function mockResetChainControllerState() {
  ChainController.state.chains = new Map()
  ChainController.state.activeChain = undefined
}
