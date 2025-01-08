import { beforeEach, describe, it, vi, type Mock, expect } from 'vitest'
import { BitcoinAdapter, type BitcoinConnector } from '../src'
import type { BitcoinApi } from '../src/utils/BitcoinApi'
import { bitcoin, mainnet } from '@reown/appkit/networks'
import { mockUTXO } from './mocks/mockUTXO'
import { SatsConnectConnector } from '../src/connectors/SatsConnectConnector'
import { mockSatsConnectProvider } from './mocks/mockSatsConnect'
import { WalletStandardConnector } from '../src/connectors/WalletStandardConnector'
import { OKXConnector } from '../src/connectors/OKXConnector'
import { LeatherConnector } from '../src/connectors/LeatherConnector'
import { WalletConnectProvider } from '../src/utils/WalletConnectProvider'

function mockBitcoinApi(): { [K in keyof BitcoinApi.Interface]: Mock<BitcoinApi.Interface[K]> } {
  return {
    getUTXOs: vi.fn(async () => [])
  }
}

describe('BitcoinAdapter', () => {
  let adapter: BitcoinAdapter
  let api: ReturnType<typeof mockBitcoinApi>

  beforeEach(() => {
    api = mockBitcoinApi()
    adapter = new BitcoinAdapter({ api, networks: [bitcoin] })
  })

  describe('connectWalletConnect', () => {
    const mockWalletConnect = {
      type: 'WALLET_CONNECT',
      provider: {
        on: vi.fn(),
        connect: vi.fn()
      }
    }

    beforeEach(() => {
      adapter.connectors.push(mockWalletConnect as any)
    })

    it('should call connect from WALLET_CONNECT connector', async () => {
      const onUri = vi.fn()
      await adapter.connectWalletConnect(onUri)

      mockWalletConnect.provider.on.mock.calls.find(([name]) => name === 'display_uri')![1](
        'mock_uri'
      )

      expect(onUri).toHaveBeenCalled()
      expect(mockWalletConnect.provider.connect).toHaveBeenCalled()
    })

    it('should throw if caipNetworks is not defined', async () => {
      adapter = new BitcoinAdapter({ api })
      await expect(adapter.connectWalletConnect(vi.fn())).rejects.toThrow()
    })
  })

  describe('connect', () => {
    it('should return the chainId of the available chain from connector', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })
      vi.spyOn(connector, 'connect').mockResolvedValueOnce('mock_address')

      adapter.connectors.push(connector)

      const result = await adapter.connect({
        id: connector.id,
        chainId: 'bitcoin:any_chain_id',
        provider: connector.provider,
        type: 'mock_type'
      })

      expect(result).toEqual({
        id: connector.id,
        type: connector.type,
        address: 'mock_address',
        chainId: bitcoin.id,
        provider: connector.provider
      })
    })

    it('should throw if connector is not found', async () => {
      await expect(adapter.connect({ id: 'invalid_id', type: 'invalid_type' })).rejects.toThrow()
    })

    it('should throw if chain is not found', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })
      vi.spyOn(connector, 'connect').mockResolvedValueOnce('mock_address')
      vi.spyOn(connector, 'chains', 'get').mockReturnValue([])

      adapter.connectors.push(connector)

      await expect(
        adapter.connect({ id: connector.id, type: connector.type, chainId: 'invalid_chain_id' })
      ).rejects.toThrow()
    })
  })

  describe('getAccounts', () => {
    let connector: BitcoinConnector

    beforeEach(() => {
      connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })

      adapter.connectors.push(connector)
    })

    it('should return the accounts', async () => {
      vi.spyOn(connector, 'getAccountAddresses').mockResolvedValueOnce([
        { address: 'mock_address_1', purpose: 'payment' },
        { address: 'mock_address_2', purpose: 'ordinal' },
        { address: 'mock_address_3', purpose: 'stx' }
      ])

      const accounts = await adapter.getAccounts({ id: connector.id })

      expect(accounts).toEqual({
        accounts: [
          { address: 'mock_address_1', type: 'payment', namespace: 'bip122' },
          { address: 'mock_address_2', type: 'ordinal', namespace: 'bip122' },
          { address: 'mock_address_3', type: 'stx', namespace: 'bip122' }
        ]
      })
    })

    it('should return empty accounts if no addresses', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })
      vi.spyOn(connector, 'getAccountAddresses').mockResolvedValueOnce([])

      adapter.connectors.push(connector)

      const accounts = await adapter.getAccounts({ id: connector.id })

      expect(accounts).toEqual({ accounts: [] })
    })

    it('should return empty accounts if connector is not found', async () => {
      const accounts = await adapter.getAccounts({ id: 'invalid_id' })

      expect(accounts).toEqual({ accounts: [] })
    })

    it('should return empty accounts if connector.getAccountsAddresses throws', async () => {
      vi.spyOn(connector, 'getAccountAddresses').mockRejectedValueOnce(new Error('mock_error'))

      const accounts = await adapter.getAccounts({ id: connector.id })

      expect(accounts).toEqual({ accounts: [] })
    })

    it('should attach payment type if purpose is not found', async () => {
      vi.spyOn(connector, 'getAccountAddresses').mockResolvedValueOnce([
        { address: 'mock_address' } as any
      ])

      const accounts = await adapter.getAccounts({ id: connector.id })

      expect(accounts).toEqual({
        accounts: [{ address: 'mock_address', type: 'payment', namespace: 'bip122' }]
      })
    })
  })

  describe('syncConnectors', () => {
    it('should get wallets from all the available connectors', () => {
      const walletStandardConnectorSpy = vi.spyOn(WalletStandardConnector, 'watchWallets')
      const satsConnectConnectorSpy = vi.spyOn(SatsConnectConnector, 'getWallets')
      const okxConnectorSpy = vi.spyOn(OKXConnector, 'getWallet')

      adapter.syncConnectors(undefined, undefined)

      expect(walletStandardConnectorSpy).toHaveBeenCalled()
      expect(satsConnectConnectorSpy).toHaveBeenCalled()
      expect(okxConnectorSpy).toHaveBeenCalled()
    })

    it('should add connectors from SatsConnectConnector', () => {
      mockSatsConnectProvider()
      adapter.syncConnectors(undefined, undefined)

      expect(adapter.connectors).toHaveLength(1)
      expect(adapter.connectors[0]).toBeInstanceOf(SatsConnectConnector)
    })

    it('should map LeatherConnector', () => {
      mockSatsConnectProvider({ id: LeatherConnector.ProviderId, name: 'Leather' })
      adapter.syncConnectors(undefined, undefined)

      expect(adapter.connectors[1]).toBeInstanceOf(LeatherConnector)
    })

    it('should add OKXConnector', () => {
      ;(window as any).okxwallet = { bitcoin: { connect: vi.fn() } }

      adapter.syncConnectors(undefined, undefined)

      expect(adapter.connectors[0]).toBeInstanceOf(OKXConnector)
    })

    it('should pass correct getActiveNetwork to SatsConnectConnector', () => {
      const mocks = mockSatsConnectProvider({ id: LeatherConnector.ProviderId, name: 'Leather' })
      const getCaipNetwork = vi.fn(() => bitcoin)
      adapter.syncConnectors(undefined, { getCaipNetwork } as any)

      vi.spyOn(mocks.wallet, 'request').mockResolvedValueOnce(
        mockSatsConnectProvider.mockRequestResolve({ hex: 'mock_hex', txid: 'mock_txid' })
      )

      const connector = adapter.connectors.find(
        c => c instanceof LeatherConnector
      ) as LeatherConnector

      connector.signPSBT({ psbt: 'mock_psbt', signInputs: [] })

      expect(getCaipNetwork).toHaveBeenCalled()
    })
  })

  describe('syncConnection', () => {
    it('should forward the call to connect', async () => {
      const connectSpy = vi.spyOn(adapter, 'connect').mockResolvedValueOnce({
        id: 'mock_id',
        type: 'ANNOUNCED',
        address: 'mock_address',
        chainId: 'mock_chain_id',
        provider: undefined
      })

      await adapter.syncConnection({
        id: 'mock_id',
        chainId: 'mock_chain_id',
        namespace: 'bip122',
        rpcUrl: 'mock_rpc_url'
      })

      expect(connectSpy).toHaveBeenCalledWith({ id: 'mock_id', chainId: 'mock_chain_id', type: '' })
    })
  })

  describe('getBalance', () => {
    it('should return the balance', async () => {
      api.getUTXOs.mockResolvedValueOnce([
        mockUTXO({ value: 10000 }),
        mockUTXO({ value: 20000 }),
        mockUTXO({ value: 30000 }),
        mockUTXO({ value: 10000000000 })
      ])

      const balance = await adapter.getBalance({
        address: 'mock_address',
        chainId: bitcoin.id,
        caipNetwork: bitcoin
      })

      expect(balance).toEqual({
        balance: '100.0006',
        symbol: 'BTC'
      })
    })

    it('should return empty balance if no UTXOs', async () => {
      api.getUTXOs.mockResolvedValueOnce([])

      const balance = await adapter.getBalance({
        address: 'mock_address',
        chainId: bitcoin.id,
        caipNetwork: bitcoin
      })

      expect(balance).toEqual({
        balance: '0',
        symbol: 'BTC'
      })
    })

    it('should return empty balance if chain is not bip122', async () => {
      const balance = await adapter.getBalance({
        address: 'mock_address',
        chainId: mainnet.id,
        caipNetwork: mainnet as any
      })

      expect(balance).toEqual({
        balance: '0',
        symbol: bitcoin.nativeCurrency.symbol
      })
    })

    it('should return empty balance if chain is not provided', async () => {
      const balance = await adapter.getBalance({
        address: 'mock_address',
        chainId: 'mock_chain_id'
      })

      expect(balance).toEqual({
        balance: '0',
        symbol: bitcoin.nativeCurrency.symbol
      })
    })
  })

  describe('signMessage', async () => {
    let connector: BitcoinConnector

    beforeEach(() => {
      connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })
    })

    it('should return the signature', async () => {
      vi.spyOn(connector, 'signMessage').mockResolvedValueOnce('mock_signature')

      const result = await adapter.signMessage({
        message: 'mock_message',
        address: 'mock_address',
        provider: connector.provider
      })

      expect(result).toEqual({ signature: 'mock_signature' })
    })

    it('should throw if connector is not found', async () => {
      await expect(
        adapter.signMessage({
          address: 'mock_address',
          message: 'mock_message',
          provider: undefined
        })
      ).rejects.toThrow()
    })
  })

  describe('getWalletConnectProvider', () => {
    it('should return the wallet connect provider', () => {
      const provider = adapter.getWalletConnectProvider({
        activeCaipNetwork: bitcoin,
        caipNetworks: [bitcoin],
        provider: undefined
      })

      expect(provider).toBeInstanceOf(WalletConnectProvider)
    })
  })

  describe('disconnect', () => {
    it('should disconnect using param provider', async () => {
      const connector = new SatsConnectConnector({
        provider: mockSatsConnectProvider().provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })
      vi.spyOn(connector, 'disconnect')

      adapter.connectors.push(connector)

      await adapter.disconnect({ provider: connector })

      expect(connector.disconnect).toHaveBeenCalled()
    })

    it('should disconnect using connector from class', async () => {
      const mocks = mockSatsConnectProvider()
      const connector = new SatsConnectConnector({
        provider: mocks.provider,
        requestedChains: [bitcoin],
        getActiveNetwork: () => bitcoin
      })
      vi.spyOn(connector, 'disconnect')
      vi.spyOn(connector, 'getAccountAddresses').mockResolvedValueOnce([
        { address: 'mock_address', purpose: 'payment' }
      ])

      adapter.connectors.push(connector)

      await adapter.connect({ id: connector.id, chainId: bitcoin.id, type: '' })
      await adapter.disconnect({})

      expect(connector.disconnect).toHaveBeenCalled()
    })
  })

  describe('connector events', () => {
    let mocks: ReturnType<typeof mockSatsConnectProvider>
    const listeners = {
      accountChanged: vi.fn(),
      disconnect: vi.fn(),
      switchNetwork: vi.fn()
    }

    beforeEach(async () => {
      mocks = mockSatsConnectProvider()
      adapter.syncConnectors()

      vi.spyOn(mocks.wallet, 'request').mockResolvedValue(
        mockSatsConnectProvider.mockRequestResolve({
          addresses: [{ address: 'mock_address' } as any]
        })
      )

      listeners.accountChanged = vi.fn(() => console.log('meu pau'))
      adapter.on('accountChanged', listeners.accountChanged)
      listeners.disconnect = vi.fn()
      adapter.on('disconnect', listeners.disconnect)
      listeners.switchNetwork = vi.fn()
      adapter.on('switchNetwork', listeners.switchNetwork)

      await adapter.connect({
        id: mocks.provider.name,
        chainId: bitcoin.id,
        type: ''
      })
    })

    it('should have bound events', () => {
      expect(mocks.wallet.addListener).toHaveBeenCalledWith('accountChange', expect.any(Function))
      expect(mocks.wallet.addListener).toHaveBeenCalledWith('disconnect', expect.any(Function))
      expect(mocks.wallet.addListener).toHaveBeenCalledWith('networkChange', expect.any(Function))
    })

    it('should emit accountsChanged on accountChange', async () => {
      const callback = mocks.wallet.addListener.mock.calls.find(
        ([name]) => name === 'accountChange'
      )![1]

      await callback({ type: 'accountChange' })

      expect(listeners.accountChanged).toHaveBeenCalled()
    })

    it('should emit disconnect on disconnect', () => {
      const callback = mocks.wallet.addListener.mock.calls.find(
        ([name]) => name === 'disconnect'
      )![1]

      callback({ type: 'disconnect' })

      expect(listeners.disconnect).toHaveBeenCalled()
    })

    it('should emit switchNetwork on networkChange', () => {
      const callback = mocks.wallet.addListener.mock.calls.find(
        ([name]) => name === 'networkChange'
      )![1]

      callback({ type: 'networkChange' })

      expect(listeners.switchNetwork).toHaveBeenCalled()
    })
  })

  it('should not throw for not used methods', async () => {
    expect(await adapter.getProfile({} as any)).toEqual({})
    expect(await adapter.estimateGas({} as any)).toEqual({})
    expect(await adapter.sendTransaction({} as any)).toEqual({})
    expect(await adapter.writeContract({} as any)).toEqual({})
    expect(await adapter.getEnsAddress({} as any)).toEqual({})
    expect(adapter.parseUnits({} as any)).toEqual(BigInt(0))
    expect(adapter.formatUnits({} as any)).toEqual('')
    expect(await adapter.grantPermissions({})).toEqual({})
    expect(await adapter.getCapabilities({} as any)).toEqual({})
    expect(await adapter.revokePermissions({} as any)).toEqual('0x')
    await expect(adapter.switchNetwork({} as any)).resolves.toBeUndefined()
  })
})
