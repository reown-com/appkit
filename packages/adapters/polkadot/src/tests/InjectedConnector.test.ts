import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PolkadotConnectorProvider } from '../../src/connectors/InjectedConnector'
import { MOCK_NETWORKS } from './mocks/mockNetworks'

describe('PolkadotConnectorProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with expected fields and provider self-reference', () => {
    const connectHandler = vi.fn()
    const connector = new PolkadotConnectorProvider({
      id: 'talisman',
      source: 'talisman',
      name: 'Talisman',
      chains: MOCK_NETWORKS,
      chain: 'polkadot',
      connectHandler
    })

    expect(connector.id).toBe('talisman')
    expect(connector.name).toBe('Talisman')
    expect(connector.type).toBe('INJECTED')
    expect(connector.provider).toBe(connector as any)
    expect(connector.namespace).toBe('polkadot')
    expect(connector.chains.length).toBeGreaterThan(0)
  })

  it('delegates connect to handler and emits connect event', async () => {
    const connectHandler = vi.fn().mockResolvedValue({ address: '5ABC' })
    const connector = new PolkadotConnectorProvider({
      id: 'subwallet',
      source: 'subwallet-js',
      name: 'SubWallet',
      chains: MOCK_NETWORKS,
      chain: 'polkadot',
      connectHandler
    })

    const onConnect = vi.fn()
    connector.on('connect', onConnect)
    const addr = await connector.connect()
    expect(connectHandler).toHaveBeenCalledWith('subwallet-js')
    expect(onConnect).toHaveBeenCalledWith('5ABC')
    expect(addr).toBe('5ABC')
  })

  it('isInstalled checks injectedWeb3 presence', () => {
    const connector = new PolkadotConnectorProvider({
      id: 'polkadot',
      source: 'polkadot-js',
      name: 'Polkadot.js',
      chains: MOCK_NETWORKS,
      chain: 'polkadot',
      connectHandler: vi.fn()
    })
    ;(window as any).injectedWeb3 = { 'polkadot-js': { name: 'polkadot-js', version: '1.0.0' } }
    expect(connector.isInstalled()).toBe(true)
  })

  it('disconnect clears state and emits disconnect', async () => {
    const connector = new PolkadotConnectorProvider({
      id: 'talisman',
      source: 'talisman',
      name: 'Talisman',
      chains: MOCK_NETWORKS,
      chain: 'polkadot',
      connectHandler: vi.fn()
    })

    const onDisconnect = vi.fn()
    connector.on('disconnect', onDisconnect)
    await connector.disconnect()
    expect(connector.provider).toBeNull()
    expect(connector.accounts.length).toBe(0)
    expect(onDisconnect).toHaveBeenCalled()
  })
})
