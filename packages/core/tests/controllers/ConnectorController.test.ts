import { describe, expect, it } from 'vitest'
import { ConnectorController } from '../../index.js'

// -- Setup --------------------------------------------------------------------
const walletConnectConnector = { id: 'walletConnect', type: 'WALLET_CONNECT' } as const
const externalConnector = { id: 'external', type: 'EXTERNAL' } as const
const metamaskConnector = {
  id: 'metamask',
  type: 'INJECTED',
  info: { rdns: 'io.metamask.com' }
} as const
const zerionConnector = {
  id: 'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18',
  type: 'INJECTED'
} as const
// -- Tests --------------------------------------------------------------------
describe('ConnectorController', () => {
  it('should have valid default state', () => {
    expect(ConnectorController.state.connectors).toEqual([])
  })

  it('should update state correctly on setConnectors()', () => {
    ConnectorController.setConnectors([walletConnectConnector])
    expect(ConnectorController.state.connectors).toEqual([walletConnectConnector])
  })

  it('should update state correctly on addConnector()', () => {
    ConnectorController.addConnector(externalConnector)
    expect(ConnectorController.state.connectors).toEqual([
      walletConnectConnector,
      externalConnector
    ])

    ConnectorController.addConnector(metamaskConnector)
    expect(ConnectorController.state.connectors).toEqual([
      walletConnectConnector,
      externalConnector,
      metamaskConnector
    ])
  })

  it('should return the correct connector on getConnector', () => {
    ConnectorController.addConnector(zerionConnector)
    expect(ConnectorController.getConnector('walletConnect', '')).toBe(undefined)
    expect(ConnectorController.getConnector('', 'io.metamask.com')).toBe(metamaskConnector)
    expect(ConnectorController.getConnector(zerionConnector.id, '')).toBeUndefined()
    expect(ConnectorController.getConnector('unknown', '')).toBeUndefined()
  })
})
