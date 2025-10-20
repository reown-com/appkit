import { beforeEach, describe, expect, it, vi } from 'vitest'

import { PolkadotAdapter } from '../../src/adapter'
import {
  accountPolkadotJs,
  accountSubwallet,
  accountTalisman,
  mockAccounts
} from './mocks/mockAccounts'
import { MOCK_NETWORKS, POLKADOT_ASSETHUB, POLKADOT_MAINNET } from './mocks/mockNetworks'
import { installPolkadotApiMocks } from './mocks/mockPolkadotApi'
import { installPolkadotExtensionMocks } from './mocks/mockPolkadotExtension'

function createAdapter(options?: ConstructorParameters<typeof PolkadotAdapter>[0]) {
  const adapter = new PolkadotAdapter(options)
  ;(adapter as any).getCaipNetworks = () => MOCK_NETWORKS
  return adapter
}

describe('PolkadotAdapter', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    ;(window as any).injectedWeb3 = undefined
  })

  describe('constructor', () => {
    it('initializes defaults', () => {
      const adapter = createAdapter()
      expect(adapter.namespace).toBe('polkadot')
      expect((adapter as any).adapterType).toBe('polkadot-injected')
    })

    it('respects custom options', () => {
      const adapter = createAdapter({ appName: 'MyDApp', preferredWallets: ['talisman'] })
      expect((adapter as any).appName).toBe('MyDApp')
      expect((adapter as any).preferredWallets).toEqual(['talisman'])
    })
  })

  describe('syncConnectors', () => {
    it('detects all installed extensions and emits connectors', () => {
      installPolkadotExtensionMocks(mockAccounts)
      const adapter = createAdapter()
      const spy = vi.fn()
      adapter.on('connectors', spy)

      adapter.syncConnectors()

      expect(adapter.connectors.length).toBeGreaterThanOrEqual(3)
      expect(spy).toHaveBeenCalled()
      const ids = adapter.connectors.map((c: any) => c.id)
      expect(ids).toEqual(expect.arrayContaining(['polkadot', 'talisman', 'subwallet']))
    })

    it('filters by preferred wallets', () => {
      installPolkadotExtensionMocks(mockAccounts)
      const adapter = createAdapter({ preferredWallets: ['talisman'] })
      adapter.syncConnectors()
      const ids = adapter.connectors.map((c: any) => c.id)
      expect(ids).toEqual(['talisman'])
    })

    it('handles no injectedWeb3 gracefully', () => {
      const adapter = createAdapter()
      adapter.syncConnectors()
      expect(adapter.connectors.length).toBe(0)
    })
  })

  describe('connect', () => {
    it('enables extensions once and connects to specific wallet', async () => {
      const { web3Enable } = installPolkadotExtensionMocks(mockAccounts)
      const adapter = createAdapter()
      const acctSpy = vi.fn()
      adapter.on('accountChanged', acctSpy)

      const res = await adapter.connect({
        id: 'talisman',
        type: 'INJECTED',
        chainId: POLKADOT_MAINNET.id
      } as any)

      expect(web3Enable).toHaveBeenCalledWith('AppKit Polkadot')
      expect(res.id).toBe('talisman')
      expect(res.address).toBe(accountTalisman.address)
      expect(res.chainId).toBe(POLKADOT_MAINNET.id)
      expect(acctSpy).toHaveBeenCalledWith(
        expect.objectContaining({ address: accountTalisman.address })
      )

      // Second connect should not call web3Enable again
      await adapter.connect({ id: 'polkadot-js', type: 'INJECTED' } as any)
      expect(web3Enable).toHaveBeenCalledTimes(1)
    })

    it('auto-selects single account', async () => {
      const { web3Accounts } = installPolkadotExtensionMocks([accountSubwallet])
      const adapter = createAdapter()
      const res = await adapter.connect({ id: 'subwallet', type: 'INJECTED' } as any)
      expect(web3Accounts).toHaveBeenCalled()
      expect(res.address).toBe(accountSubwallet.address)
    })

    it('uses onSelectAccount for multiple accounts', async () => {
      installPolkadotExtensionMocks([
        { ...accountPolkadotJs },
        { ...accountPolkadotJs, address: '5ZZZAnother' }
      ])
      const onSelectAccount = vi.fn(async accounts => accounts[1])
      const adapter = createAdapter({ onSelectAccount })
      const res = await adapter.connect({ id: 'polkadot-js', type: 'INJECTED' } as any)
      expect(onSelectAccount).toHaveBeenCalled()
      expect(res.address).toBe('5ZZZAnother')
    })

    it('throws when onSelectAccount cancels', async () => {
      installPolkadotExtensionMocks([
        { ...accountPolkadotJs },
        { ...accountPolkadotJs, address: '5YYY' }
      ])
      const onSelectAccount = vi.fn(async () => {
        throw new Error('cancel')
      })
      const adapter = createAdapter({ onSelectAccount })
      await expect(adapter.connect({ id: 'polkadot-js', type: 'INJECTED' } as any)).rejects.toThrow(
        'Account selection cancelled'
      )
    })

    it('throws when no accounts found for wallet', async () => {
      installPolkadotExtensionMocks([accountTalisman])
      const adapter = createAdapter()
      await expect(adapter.connect({ id: 'polkadot-js', type: 'INJECTED' } as any)).rejects.toThrow(
        'No accounts found for polkadot-js'
      )
    })
  })

  describe('disconnect', () => {
    it('disconnects specific wallet and emits events', async () => {
      installPolkadotExtensionMocks([accountPolkadotJs, accountTalisman])
      const adapter = createAdapter()
      await adapter.connect({ id: 'polkadot-js', type: 'INJECTED' } as any)
      await adapter.connect({ id: 'talisman', type: 'INJECTED' } as any)

      const connsBefore = adapter.connections.length
      const res = await adapter.disconnect({ id: 'talisman' } as any)
      expect(res.connections.length).toBe(connsBefore - 1)
    })

    it('disconnects all when no id provided', async () => {
      installPolkadotExtensionMocks([accountPolkadotJs])
      const adapter = createAdapter()
      await adapter.connect({ id: 'polkadot-js', type: 'INJECTED' } as any)
      const res = await adapter.disconnect({} as any)
      expect(res.connections.length).toBe(0)
    })
  })

  describe('getAccounts', () => {
    it('returns accounts for connector', async () => {
      installPolkadotExtensionMocks([accountPolkadotJs])
      const adapter = createAdapter()
      await adapter.connect({ id: 'polkadot-js', type: 'INJECTED' } as any)
      const result = await adapter.getAccounts({ id: 'polkadot-js' } as any)
      expect(result.accounts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ address: accountPolkadotJs.address, namespace: 'polkadot' })
        ])
      )
    })

    it('returns empty for unknown connector', async () => {
      const adapter = createAdapter()
      const result = await adapter.getAccounts({ id: 'unknown' } as any)
      expect(result.accounts).toEqual([])
    })
  })

  describe('getBalance', () => {
    it('fetches and formats balance using API and caches results', async () => {
      installPolkadotExtensionMocks(mockAccounts)
      const { ApiPromise } = installPolkadotApiMocks({
        accountFree: 1234500000000n,
        chainDecimals: 10,
        chainToken: 'DOT'
      })
      const adapter = createAdapter()

      const r1 = await adapter.getBalance({
        address: accountPolkadotJs.address,
        caipNetwork: POLKADOT_MAINNET
      } as any)
      expect(r1).toEqual({ balance: '123.45', symbol: 'DOT' })

      const r2 = await adapter.getBalance({
        address: accountPolkadotJs.address,
        caipNetwork: POLKADOT_MAINNET
      } as any)
      expect(r2).toEqual({ balance: '123.45', symbol: 'DOT' })
      expect(ApiPromise.create).toHaveBeenCalledTimes(1)

      await adapter.getBalance({
        address: accountPolkadotJs.address,
        caipNetwork: POLKADOT_ASSETHUB
      } as any)
      expect(ApiPromise.create).toHaveBeenCalledTimes(2)
    })

    it('returns zero on API errors', async () => {
      // Force ApiPromise.create to reject
      const { ApiPromise } = installPolkadotApiMocks()
      ;(ApiPromise.create as any).mockRejectedValueOnce(new Error('network'))
      const adapter = createAdapter()
      const r = await adapter.getBalance({
        address: accountPolkadotJs.address,
        caipNetwork: POLKADOT_MAINNET
      } as any)
      expect(r).toEqual({ balance: '0', symbol: 'DOT' })
    })
  })

  describe('signMessage', () => {
    it('signs raw message via injector signer', async () => {
      const { signer } = installPolkadotExtensionMocks([accountPolkadotJs])
      const adapter = createAdapter()
      await adapter.connect({ id: 'polkadot-js', type: 'INJECTED' } as any)
      const res = await adapter.signMessage({
        address: accountPolkadotJs.address,
        message: 'hello'
      } as any)
      expect(res.signature).toBeDefined()
      expect(signer.signRaw).toHaveBeenCalledWith(
        expect.objectContaining({ address: accountPolkadotJs.address, type: 'bytes' })
      )
      const call = (signer.signRaw as any).mock.calls[0][0]
      expect(call.data.startsWith('0x')).toBe(true)
    })

    it('throws when no connection for address', async () => {
      installPolkadotExtensionMocks([accountPolkadotJs])
      const adapter = createAdapter()
      await expect(
        adapter.signMessage({ address: '5Unconnected', message: 'hello' } as any)
      ).rejects.toThrow('No connection found for address')
    })

    it('throws when wallet lacks signRaw', async () => {
      const { web3FromAddress } = installPolkadotExtensionMocks([accountPolkadotJs])
      ;(web3FromAddress as any).mockResolvedValueOnce({ signer: {} })
      const adapter = createAdapter()
      await adapter.connect({ id: 'polkadot-js', type: 'INJECTED' } as any)
      await expect(
        adapter.signMessage({ address: accountPolkadotJs.address, message: 'msg' } as any)
      ).rejects.toThrow('Wallet does not support message signing')
    })
  })

  describe('sendTransaction', () => {
    it('throws not implemented', async () => {
      const adapter = createAdapter()
      await expect(adapter.sendTransaction({} as any)).rejects.toThrow('not yet implemented')
    })
  })

  describe('sync methods', () => {
    it('syncConnections no-ops on browser', async () => {
      const adapter = createAdapter()
      await expect(adapter.syncConnections({} as any)).resolves.toBeUndefined()
    })

    it('syncConnection delegates to connect', async () => {
      const adapter = createAdapter()
      const spy = vi
        .spyOn(adapter, 'connect')
        .mockResolvedValue({ id: 'polkadot-js', address: 'x', chainId: 'y' } as any)
      await adapter.syncConnection({ id: 'polkadot-js', chainId: POLKADOT_MAINNET.id } as any)
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'polkadot-js', type: 'INJECTED' })
      )
    })
  })

  describe('units helpers', () => {
    it('parseUnits and formatUnits', () => {
      const adapter = createAdapter()
      expect(adapter.parseUnits({ value: '1.5', decimals: 10 } as any)).toBe(15000000000n)
      expect(adapter.formatUnits({ value: 15000000000n as any, decimals: 10 } as any)).toBe('1.5')
      expect(adapter.formatUnits({ value: 500000000n as any, decimals: 10 } as any)).toBe('0.05')
    })
  })
})
