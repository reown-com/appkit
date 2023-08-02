import { describe, expect, it } from 'vitest'
import { ConnectorController } from '../../index.js'

// -- Setup --------------------------------------------------------------------
const walletConnectConnector = { id: 'walletConnect', type: 'WALLET_CONNECT' } as const
const externalConnector = { id: 'external', type: 'EXTERNAL' } as const

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
  })

  it('should update state correctly on removeConnector()', () => {
    ConnectorController.removeConnectorById('external')
    expect(ConnectorController.state.connectors).toEqual([walletConnectConnector])
  })
})
