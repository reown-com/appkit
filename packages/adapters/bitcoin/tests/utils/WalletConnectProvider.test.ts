import * as bitcoinjs from 'bitcoinjs-lib'
import { type Mock, beforeEach, describe, expect, it, vi } from 'vitest'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'
import { type AccountState, ChainController } from '@reown/appkit-controllers'
import { bitcoin, bitcoinSignet, bitcoinTestnet } from '@reown/appkit/networks'

import { BitcoinWalletConnectConnector } from '../../src/connectors/BitcoinWalletConnectConnector'
import { mockUniversalProvider } from '../mocks/mockUniversalProvider'

describe('LeatherConnector', () => {
  let requestedChains: CaipNetwork[]
  let provider: BitcoinWalletConnectConnector
  let getActiveChain: Mock<() => CaipNetwork | undefined>
  let universalProvider: ReturnType<typeof mockUniversalProvider>

  beforeEach(() => {
    requestedChains = [bitcoin, bitcoinTestnet]
    universalProvider = mockUniversalProvider()
    getActiveChain = vi.fn(() => bitcoin)
    provider = new BitcoinWalletConnectConnector({
      provider: universalProvider,
      chains: requestedChains,
      getActiveChain: getActiveChain
    })
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue(requestedChains)
  })

  it('should validate the metadata', async () => {
    expect(provider.chain).toBe('bip122')
    expect(provider.type).toBe('WALLET_CONNECT')
    expect(provider.id).toBe(ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT)
    expect(provider.name).toBe('WalletConnect')
  })

  it('should return the chains filtered by the requested chains', async () => {
    universalProvider.session = mockUniversalProvider.mockSession({
      namespaces: {
        bip122: {
          accounts: [`${bitcoin.caipNetworkId}:address`],
          events: [],
          methods: []
        },
        eip155: {
          accounts: [`eip155:1:evm_address`],
          events: [],
          methods: []
        }
      }
    })

    expect(provider.chains).toEqual([bitcoin])
  })

  describe('connect', () => {
    it('should reject the connection', async () => {
      await expect(provider.connect()).rejects.toThrow(
        'Connection of WalletConnectProvider should be done via UniversalAdapter'
      )
    })
  })

  describe('disconnect', () => {
    it('should disconnect the provider', async () => {
      await provider.disconnect()
      expect(universalProvider.disconnect).toHaveBeenCalled()
    })
  })

  describe('signMessage', () => {
    beforeEach(() => {
      universalProvider.session = mockUniversalProvider.mockSession()
    })

    it('should sign the message and parse response', async () => {
      const requestSpy = vi.spyOn(universalProvider, 'request')
      requestSpy.mockResolvedValueOnce({
        signature: '6d6f636b5f7369676e6174757265'
      })

      const result = await provider.signMessage({
        message: 'mock_message',
        address: 'mock_address'
      })

      expect(requestSpy).toHaveBeenCalledWith(
        {
          method: 'signMessage',
          params: {
            message: 'mock_message',
            account: 'mock_address',
            address: 'mock_address'
          }
        },
        bitcoin.caipNetworkId
      )
      expect(result).toBe('bW9ja19zaWduYXR1cmU=')
    })

    it('should throw an error if the method is not supported', async () => {
      universalProvider.session = mockUniversalProvider.mockSession({
        namespaces: {
          bip122: {
            accounts: [`${bitcoin.caipNetworkId}:address`],
            events: [],
            methods: []
          }
        }
      })

      await expect(
        provider.signMessage({ message: 'mock_message', address: 'mock_address' })
      ).rejects.toThrow('Method signMessage is not supported')
    })
  })

  describe('sendTransfer', () => {
    beforeEach(() => {
      universalProvider.session = mockUniversalProvider.mockSession()
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        caipAddress: `${bitcoin.caipNetworkId}:address`,
        address: 'address'
      } as unknown as AccountState)
    })

    it('should send the transfer and parse response', async () => {
      const requestSpy = vi.spyOn(universalProvider, 'request')
      requestSpy.mockResolvedValueOnce({ txid: 'mock_txid' })

      const result = await provider.sendTransfer({
        recipient: 'mock_recipient',
        amount: 'mock_amount'
      })

      expect(requestSpy).toHaveBeenCalledWith(
        {
          method: 'sendTransfer',
          params: {
            account: 'address',
            recipientAddress: 'mock_recipient',
            amount: 'mock_amount'
          }
        },
        bitcoin.caipNetworkId
      )
      expect(result).toBe('mock_txid')
    })

    it('should throw an error if the method is not supported', async () => {
      universalProvider.session = mockUniversalProvider.mockSession({
        namespaces: {
          bip122: {
            accounts: [`${bitcoin.caipNetworkId}:address`],
            events: [],
            methods: []
          }
        }
      })

      await expect(
        provider.sendTransfer({ recipient: 'mock_recipient', amount: 'mock_amount' })
      ).rejects.toThrow('Method sendTransfer is not supported')
    })

    it('should throw an error if the account is not found', async () => {
      universalProvider.session = mockUniversalProvider.mockSession({
        namespaces: {
          bip122: {
            accounts: [],
            events: [],
            methods: ['sendTransfer']
          }
        }
      })

      await expect(
        provider.sendTransfer({ recipient: 'mock_recipient', amount: 'mock_amount' })
      ).rejects.toThrow('Account not found')
    })

    it('should throw an error if account is malformed', async () => {
      universalProvider.session = mockUniversalProvider.mockSession({
        namespaces: {
          bip122: {
            accounts: ['address'],
            events: [],
            methods: ['sendTransfer']
          }
        }
      })

      await expect(
        provider.sendTransfer({ recipient: 'mock_recipient', amount: 'mock_amount' })
      ).rejects.toThrow('Account not found')
    })
  })

  describe('getAccountAddresses', () => {
    beforeEach(() => {
      universalProvider.session = mockUniversalProvider.mockSession()
      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        caipAddress: `${bitcoin.caipNetworkId}:address`,
        address: 'address'
      } as unknown as AccountState)
    })

    it('should get the account addresses and parse response', async () => {
      const requestSpy = vi.spyOn(universalProvider, 'request')
      requestSpy.mockResolvedValueOnce(['mock_address'])

      const result = await provider.getAccountAddresses()

      expect(requestSpy).toHaveBeenCalledWith(
        {
          method: 'getAccountAddresses',
          params: { account: 'address' }
        },
        bitcoin.caipNetworkId
      )
      expect(result).toEqual([{ address: 'mock_address', purpose: 'payment' }])
    })

    it('should throw an error if the method is not supported', async () => {
      universalProvider.session = mockUniversalProvider.mockSession({
        namespaces: {
          bip122: {
            accounts: [`${bitcoin.caipNetworkId}:address`],
            events: [],
            methods: []
          }
        }
      })

      await expect(provider.getAccountAddresses()).rejects.toThrow(
        'Method getAccountAddresses is not supported'
      )
    })
  })

  describe('signPSBT', () => {
    beforeEach(() => {
      universalProvider.session = mockUniversalProvider.mockSession()
    })

    const MAINNET_ACCOUNT = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
    const OTHER_ACCOUNT = '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'
    const TAPROOT_ACCOUNT = 'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0'

    function connectAccount(caipNetworkId: string, address: string) {
      universalProvider.session = mockUniversalProvider.mockSession({
        namespaces: {
          bip122: {
            accounts: [`${caipNetworkId}:${address}`],
            events: [],
            methods: ['signPsbt']
          }
        }
      })
      vi.spyOn(ChainController, 'getAccountData').mockReturnValueOnce({
        caipAddress: `${caipNetworkId}:${address}`,
        address
      } as unknown as AccountState)
    }

    function createPsbt(owners: string[], network = bitcoinjs.networks.bitcoin) {
      const psbt = new bitcoinjs.Psbt({ network })

      owners.forEach((owner, index) => {
        psbt.addInput({
          hash: Buffer.alloc(32, index + 1),
          index,
          witnessUtxo: { script: bitcoinjs.address.toOutputScript(owner, network), value: 10_000 }
        })
      })
      psbt.addOutput({ address: owners[0] as string, value: 5_000 })

      return psbt.toBase64()
    }

    function createLegacyPsbt(owner: string) {
      const network = bitcoinjs.networks.bitcoin
      const previousTx = new bitcoinjs.Transaction()
      previousTx.addInput(Buffer.alloc(32, 9), 0)
      previousTx.addOutput(bitcoinjs.address.toOutputScript(owner, network), 10_000)

      const psbt = new bitcoinjs.Psbt({ network })
      psbt.addInput({
        hash: previousTx.getId(),
        index: 0,
        nonWitnessUtxo: previousTx.toBuffer()
      })
      psbt.addOutput({ address: owner, value: 5_000 })

      return psbt.toBase64()
    }

    async function requestedSignInputs(
      psbt: string,
      signInputs: Parameters<BitcoinWalletConnectConnector['signPSBT']>[0]['signInputs'] = []
    ) {
      const requestSpy = vi.spyOn(universalProvider, 'request')
      requestSpy.mockResolvedValueOnce({ psbt: 'signed_psbt' })

      await provider.signPSBT({ psbt, signInputs, broadcast: false })

      return requestSpy.mock.calls[0]?.[0].params as { signInputs: unknown; broadcast: boolean }
    }

    it('should sign the PSBT and parse response', async () => {
      const requestSpy = vi.spyOn(universalProvider, 'request')
      requestSpy.mockResolvedValueOnce({ psbt: 'mock_psbt', txid: 'mock_txid' })

      const result = await provider.signPSBT({
        psbt: 'mock_psbt',
        signInputs: [],
        broadcast: true
      })

      expect(requestSpy).toHaveBeenCalledWith(
        {
          method: 'signPsbt',
          params: {
            account: 'address',
            psbt: 'mock_psbt',
            signInputs: [],
            broadcast: true
          }
        },
        bitcoin.caipNetworkId
      )
      expect(result).toEqual({ psbt: 'mock_psbt', txid: 'mock_txid' })
    })

    it('should throw an error if the method is not supported', async () => {
      universalProvider.session = mockUniversalProvider.mockSession({
        namespaces: {
          bip122: {
            accounts: [`${bitcoin.caipNetworkId}:address`],
            events: [],
            methods: []
          }
        }
      })

      await expect(
        provider.signPSBT({ psbt: 'mock_psbt', signInputs: [], broadcast: true })
      ).rejects.toThrow('Method signPsbt is not supported')
    })

    it('should throw an error if the account is not found', async () => {
      universalProvider.session = mockUniversalProvider.mockSession({
        namespaces: {
          bip122: {
            accounts: [],
            events: [],
            methods: ['signPsbt']
          }
        }
      })

      await expect(
        provider.signPSBT({ psbt: 'mock_psbt', signInputs: [], broadcast: true })
      ).rejects.toThrow('Account not found')
    })

    it('derives the signInputs from the inputs owned by the account when signInputs is empty', async () => {
      connectAccount(bitcoin.caipNetworkId, MAINNET_ACCOUNT)

      const params = await requestedSignInputs(createPsbt([MAINNET_ACCOUNT, MAINNET_ACCOUNT]))

      expect(params.signInputs).toEqual([
        { address: MAINNET_ACCOUNT, index: 0, sighashTypes: [1] },
        { address: MAINNET_ACCOUNT, index: 1, sighashTypes: [1] }
      ])
      expect(params.broadcast).toBe(false)
    })

    it('skips inputs owned by other addresses and keeps the PSBT index', async () => {
      connectAccount(bitcoin.caipNetworkId, MAINNET_ACCOUNT)

      const params = await requestedSignInputs(
        createPsbt([OTHER_ACCOUNT, MAINNET_ACCOUNT, OTHER_ACCOUNT, MAINNET_ACCOUNT])
      )

      expect(params.signInputs).toEqual([
        { address: MAINNET_ACCOUNT, index: 1, sighashTypes: [1] },
        { address: MAINNET_ACCOUNT, index: 3, sighashTypes: [1] }
      ])
    })

    it('keeps a non-empty signInputs untouched', async () => {
      connectAccount(bitcoin.caipNetworkId, MAINNET_ACCOUNT)
      const signInputs = [{ address: MAINNET_ACCOUNT, index: 1, sighashTypes: [2] }]

      const params = await requestedSignInputs(
        createPsbt([MAINNET_ACCOUNT, MAINNET_ACCOUNT]),
        signInputs
      )

      expect(params.signInputs).toBe(signInputs)
    })

    it('keeps signInputs empty when no input is owned by the account', async () => {
      connectAccount(bitcoin.caipNetworkId, MAINNET_ACCOUNT)

      const params = await requestedSignInputs(createPsbt([OTHER_ACCOUNT]))

      expect(params.signInputs).toEqual([])
    })

    it('keeps signInputs empty when the PSBT cannot be decoded', async () => {
      connectAccount(bitcoin.caipNetworkId, MAINNET_ACCOUNT)

      const params = await requestedSignInputs('not_a_psbt')

      expect(params.signInputs).toEqual([])
    })

    it('keeps signInputs empty when the account is not a valid address', async () => {
      connectAccount(bitcoin.caipNetworkId, 'address')

      const params = await requestedSignInputs(createPsbt([MAINNET_ACCOUNT]))

      expect(params.signInputs).toEqual([])
    })

    it('keeps signInputs empty for a Taproot account', async () => {
      connectAccount(bitcoin.caipNetworkId, TAPROOT_ACCOUNT)

      const params = await requestedSignInputs(createPsbt([MAINNET_ACCOUNT]))

      expect(params.signInputs).toEqual([])
    })

    it('derives the signInputs from nonWitnessUtxo for legacy accounts', async () => {
      connectAccount(bitcoin.caipNetworkId, OTHER_ACCOUNT)

      const params = await requestedSignInputs(createLegacyPsbt(OTHER_ACCOUNT))

      expect(params.signInputs).toEqual([{ address: OTHER_ACCOUNT, index: 0, sighashTypes: [1] }])
    })

    it('derives the signInputs for a testnet account on the testnet chain', async () => {
      const testnetAccount = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'
      getActiveChain.mockReturnValue(bitcoinTestnet)
      connectAccount(bitcoinTestnet.caipNetworkId, testnetAccount)

      const params = await requestedSignInputs(
        createPsbt([testnetAccount], bitcoinjs.networks.testnet)
      )

      expect(params.signInputs).toEqual([{ address: testnetAccount, index: 0, sighashTypes: [1] }])
    })

    it('derives the signInputs for a signet account on the signet chain', async () => {
      const signetAccount = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'
      getActiveChain.mockReturnValue(bitcoinSignet)
      connectAccount(bitcoinSignet.caipNetworkId, signetAccount)

      const params = await requestedSignInputs(
        createPsbt([signetAccount], bitcoinjs.networks.testnet)
      )

      expect(params.signInputs).toEqual([{ address: signetAccount, index: 0, sighashTypes: [1] }])
    })

    it('keeps signInputs empty when a testnet account is used while the active chain is mainnet', async () => {
      const testnetAccount = 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'
      connectAccount(bitcoin.caipNetworkId, testnetAccount)

      const params = await requestedSignInputs(
        createPsbt([testnetAccount], bitcoinjs.networks.testnet)
      )

      expect(params.signInputs).toEqual([])
    })

    it('still throws Chain not found when there is no active chain', async () => {
      connectAccount(bitcoin.caipNetworkId, MAINNET_ACCOUNT)
      getActiveChain.mockReturnValue(undefined)

      await expect(
        provider.signPSBT({
          psbt: createPsbt([MAINNET_ACCOUNT]),
          signInputs: [],
          broadcast: false
        })
      ).rejects.toThrow('Chain not found')
    })
  })

  describe('request', () => {
    it('should forward request to the universal provider', async () => {
      const requestSpy = vi.spyOn(universalProvider, 'request')
      requestSpy.mockResolvedValueOnce({ result: 'mock_result' })

      const result = await provider.request({ method: 'mock_method', params: {} })

      expect(requestSpy).toHaveBeenCalledWith(
        { method: 'mock_method', params: {} },
        bitcoin.caipNetworkId
      )
      expect(result).toEqual({ result: 'mock_result' })
    })

    it('should throw if there is no active chain', async () => {
      getActiveChain.mockReturnValueOnce(undefined)

      await expect(provider.request({ method: 'mock_method', params: {} })).rejects.toThrow(
        'Chain not found'
      )
    })
  })

  describe('getAccount', () => {
    /**
     * These tests are to verify `getAccount` method without the `required` parameter.
     * As `getAccount` is private method, these tests should be removed when there is a
     * call to this method internally without the `required` parameter and the method
     * should be tested through public methods that call it.
     **/

    it('should return the account address', () => {
      universalProvider.session = mockUniversalProvider.mockSession()

      const result = (provider as any).getAccount()

      expect(result).toBe('address')
    })

    it('should throw an error if the account is not found', () => {
      universalProvider.session = mockUniversalProvider.mockSession({
        namespaces: {
          bip122: {
            accounts: [],
            events: [],
            methods: []
          }
        }
      })

      expect((provider as any).getAccount()).toBeUndefined()
    })

    it('should throw an error if the account is malformed', () => {
      universalProvider.session = mockUniversalProvider.mockSession({
        namespaces: {
          bip122: {
            accounts: ['address'],
            events: [],
            methods: []
          }
        }
      })

      expect((provider as any).getAccount()).toBeUndefined()
    })

    it('should select the correct address when multiple networks have addresses', () => {
      universalProvider.session = mockUniversalProvider.mockSession({
        namespaces: {
          bip122: {
            accounts: [
              `${bitcoin.caipNetworkId}:mainnet_address`,
              `${bitcoinTestnet.caipNetworkId}:testnet_address`
            ],
            events: [],
            methods: []
          }
        }
      })

      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        caipAddress: `${bitcoin.caipNetworkId}:mainnet_address`,
        address: 'mainnet_address'
      } as unknown as AccountState)

      const result = (provider as any).getAccount()

      expect(result).toBe('mainnet_address')
    })

    it('should select testnet address when testnet is active chain', () => {
      universalProvider.session = mockUniversalProvider.mockSession({
        namespaces: {
          bip122: {
            accounts: [
              `${bitcoin.caipNetworkId}:mainnet_address`,
              `${bitcoinTestnet.caipNetworkId}:testnet_address`
            ],
            events: [],
            methods: []
          }
        }
      })

      vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
        caipAddress: `${bitcoinTestnet.caipNetworkId}:testnet_address`,
        address: 'testnet_address'
      } as unknown as AccountState)

      const result = (provider as any).getAccount()

      expect(result).toBe('testnet_address')
    })
  })
})
