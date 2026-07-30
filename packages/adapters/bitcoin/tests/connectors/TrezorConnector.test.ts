import TrezorConnect from '@trezor/connect-web'
import * as btc from 'bitcoinjs-lib'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CoreHelperUtil } from '@reown/appkit-controllers'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { TrezorConnector } from '../../src/connectors/TrezorConnector'
import { MethodNotSupportedError } from '../../src/errors/MethodNotSupportedError'

// Mock TrezorConnect
vi.mock('@trezor/connect-web', () => ({
  default: {
    init: vi.fn(() => Promise.resolve()),
    getAddress: vi.fn(() =>
      Promise.resolve({
        success: true,
        payload: [
          {
            address: 'bc1qmock_payment_address',
            publicKey: 'mock_public_key_payment',
            serializedPath: "m/84'/0'/0'/0/0"
          },
          {
            address: 'bc1qmock_ordinal_address',
            publicKey: 'mock_public_key_ordinal',
            serializedPath: "m/84'/0'/0'/0/1"
          }
        ]
      })
    ),
    signMessage: vi.fn(() =>
      Promise.resolve({
        success: true,
        payload: {
          signature: 'mock_signature'
        }
      })
    ),
    composeTransaction: vi.fn(() =>
      Promise.resolve({
        success: true,
        payload: {
          txid: 'mock_txid'
        }
      })
    ),
    signTransaction: vi.fn(() =>
      Promise.resolve({
        success: true,
        payload: {
          serializedTx:
            '0100000001000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000'
        }
      })
    ),
    pushTransaction: vi.fn(() =>
      Promise.resolve({
        success: true,
        payload: {
          txid: 'mock_broadcast_txid'
        }
      })
    ),
    blockchainSetCustomBackend: vi.fn(() => Promise.resolve({ success: true, payload: true }))
  }
}))

describe('TrezorConnector', () => {
  let connector: TrezorConnector

  beforeEach(() => {
    vi.clearAllMocks()
    connector = new TrezorConnector({
      requestedChains: [bitcoin, bitcoinTestnet]
    })
  })

  it('should validate metadata', () => {
    expect(connector.id).toBe('trezor')
    expect(connector.name).toBe('Trezor')
    expect(connector.chain).toBe('bip122')
    expect(connector.type).toBe('ANNOUNCED')
  })

  it('should return bitcoin chains', () => {
    expect(connector.chains).toEqual([bitcoin, bitcoinTestnet])
  })

  describe('connect', () => {
    it('should connect and return payment address', async () => {
      const address = await connector.connect()
      expect(address).toBe('bc1qmock_payment_address')
    })

    it('should emit accountsChanged on connect', async () => {
      const listener = vi.fn()
      connector.on('accountsChanged', listener)
      await connector.connect()
      expect(listener).toHaveBeenCalledWith(['bc1qmock_payment_address'])
    })
  })

  describe('disconnect', () => {
    it('should emit disconnect event', async () => {
      const listener = vi.fn()
      connector.on('disconnect', listener)
      await connector.disconnect()
      expect(listener).toHaveBeenCalled()
    })
  })

  describe('getAccountAddresses', () => {
    it('should return addresses with correct purposes', async () => {
      const addresses = await connector.getAccountAddresses()

      expect(addresses).toHaveLength(2)
      expect(addresses[0]).toEqual({
        address: 'bc1qmock_payment_address',
        publicKey: undefined,
        path: "m/84'/0'/0'/0/0",
        purpose: 'payment'
      })
      expect(addresses[1]).toEqual({
        address: 'bc1qmock_ordinal_address',
        publicKey: undefined,
        path: "m/84'/0'/0'/0/1",
        purpose: 'ordinal'
      })
    })
  })

  describe('signMessage', () => {
    it('should sign a message with ecdsa', async () => {
      await connector.connect()
      const signature = await connector.signMessage({
        address: 'bc1qmock_payment_address',
        message: 'test message',
        protocol: 'ecdsa'
      })

      expect(signature).toBe('mock_signature')
    })

    it('should sign a message without protocol (defaults to ecdsa)', async () => {
      await connector.connect()
      const signature = await connector.signMessage({
        address: 'bc1qmock_payment_address',
        message: 'test message'
      })

      expect(signature).toBe('mock_signature')
    })

    it('should throw error for bip322 protocol', async () => {
      await connector.connect()
      await expect(
        connector.signMessage({
          address: 'bc1qmock_payment_address',
          message: 'test message',
          protocol: 'bip322'
        })
      ).rejects.toThrow(MethodNotSupportedError)
    })
  })

  describe('sendTransfer', () => {
    it('should send a transfer', async () => {
      await connector.connect()
      const txid = await connector.sendTransfer({
        amount: '100000',
        recipient: 'bc1qrecipient'
      })

      expect(txid).toBe('mock_txid')
    })
  })

  describe('switchNetwork', () => {
    it('should switch to testnet', async () => {
      const listener = vi.fn()
      connector.on('chainChanged', listener)

      await connector.switchNetwork(bitcoinTestnet.caipNetworkId)

      expect(listener).toHaveBeenCalledWith(bitcoinTestnet.caipNetworkId)
    })

    it('should switch to mainnet', async () => {
      const listener = vi.fn()
      connector.on('chainChanged', listener)

      await connector.switchNetwork(bitcoin.caipNetworkId)

      expect(listener).toHaveBeenCalledWith(bitcoin.caipNetworkId)
    })
  })

  describe('request', () => {
    it('should throw MethodNotSupportedError', async () => {
      await expect(connector.request({ method: 'test' })).rejects.toThrow(MethodNotSupportedError)
    })
  })

  describe('getWallet', () => {
    it('should return undefined if not client', () => {
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(false)

      const result = TrezorConnector.getWallet({
        requestedChains: [bitcoin, bitcoinTestnet]
      })

      expect(result).toBeUndefined()
    })

    it('should return TrezorConnector instance in browser', () => {
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)

      const result = TrezorConnector.getWallet({
        requestedChains: [bitcoin, bitcoinTestnet]
      })

      expect(result).toBeInstanceOf(TrezorConnector)
    })
  })

  describe('active network', () => {
    it('derives testnet paths when constructed with the testnet CAIP id', async () => {
      const testnetConnector = new TrezorConnector({
        requestedChains: [bitcoin, bitcoinTestnet],
        requestedCaipNetworkId: bitcoinTestnet.caipNetworkId
      })

      await testnetConnector.getAccountAddresses()

      const { bundle } = vi.mocked(TrezorConnect.getAddress).mock.calls[0]![0] as {
        bundle: { path: string; coin: string }[]
      }

      expect(bundle.map(entry => entry.path)).toEqual(["m/84'/1'/0'/0/0", "m/84'/1'/0'/0/1"])
      expect(bundle.every(entry => entry.coin === 'test')).toBe(true)
    })

    it('derives mainnet paths when constructed with the mainnet CAIP id', async () => {
      const mainnetConnector = new TrezorConnector({
        requestedChains: [bitcoin, bitcoinTestnet],
        requestedCaipNetworkId: bitcoin.caipNetworkId
      })

      await mainnetConnector.getAccountAddresses()

      const { bundle } = vi.mocked(TrezorConnect.getAddress).mock.calls[0]![0] as {
        bundle: { path: string; coin: string }[]
      }

      expect(bundle[0]!.path).toBe("m/84'/0'/0'/0/0")
      expect(bundle[0]!.coin).toBe('btc')
    })

    it('registers the testnet blockbook backend so inputs can be verified', async () => {
      const testnetConnector = new TrezorConnector({
        requestedChains: [bitcoin, bitcoinTestnet],
        requestedCaipNetworkId: bitcoinTestnet.caipNetworkId
      })

      await testnetConnector.getAccountAddresses()

      expect(TrezorConnect.blockchainSetCustomBackend).toHaveBeenCalledWith({
        coin: 'test',
        blockchainLink: { type: 'blockbook', url: ['https://tbtc1.trezor.io'] }
      })
    })

    it('allows the blockbook endpoint to be overridden', async () => {
      const testnetConnector = new TrezorConnector({
        requestedChains: [bitcoin, bitcoinTestnet],
        requestedCaipNetworkId: bitcoinTestnet.caipNetworkId,
        blockbookUrls: { Testnet: ['https://blockbook.internal'] }
      })

      await testnetConnector.getAccountAddresses()

      expect(TrezorConnect.blockchainSetCustomBackend).toHaveBeenCalledWith({
        coin: 'test',
        blockchainLink: { type: 'blockbook', url: ['https://blockbook.internal'] }
      })
    })

    it('registers the backend only once per coin', async () => {
      const testnetConnector = new TrezorConnector({
        requestedChains: [bitcoin, bitcoinTestnet],
        requestedCaipNetworkId: bitcoinTestnet.caipNetworkId
      })

      await testnetConnector.getAccountAddresses()
      await testnetConnector.getAccountAddresses()

      expect(TrezorConnect.blockchainSetCustomBackend).toHaveBeenCalledTimes(1)
    })

    it('still connects when the backend cannot be registered', async () => {
      vi.mocked(TrezorConnect.blockchainSetCustomBackend).mockRejectedValueOnce(
        new Error('backend unreachable')
      )

      const testnetConnector = new TrezorConnector({
        requestedChains: [bitcoin, bitcoinTestnet],
        requestedCaipNetworkId: bitcoinTestnet.caipNetworkId
      })

      await expect(testnetConnector.getAccountAddresses()).resolves.toHaveLength(2)
    })

    it('refuses an unsupported network rather than falling back to mainnet', () => {
      expect(
        () =>
          new TrezorConnector({
            requestedChains: [bitcoin, bitcoinTestnet],
            requestedCaipNetworkId: 'bip122:00000008819873e925422c1ff0f99f7c' as never
          })
      ).toThrow('Unsupported Bitcoin network for Trezor')
    })
  })

  describe('signPSBT', () => {
    // Compressed secp256k1 generator point: a structurally valid public key, so
    // bitcoinjs-lib can build the address and finalize the signed PSBT.
    const DEVICE_PUBKEY = Buffer.from(
      '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      'hex'
    )
    // Minimal canonical DER signature (r = s = 1) plus SIGHASH_ALL.
    const DER_SIGNATURE = Buffer.from('3006020101020101' + '01', 'hex')
    // Testnet P2SH — the shape of a Rootstock peg-in federation address.
    const FEDERATION_ADDRESS = '2N2PJEucf6QY2kNFuJ4chQEBoyZWszRQE16'
    const OP_RETURN_PAYLOAD = Buffer.from('52534b5401' + '11'.repeat(20), 'hex')

    const network = btc.networks.testnet
    const devicePayment = btc.payments.p2wpkh({ pubkey: DEVICE_PUBKEY, network })
    const DEVICE_ADDRESS = devicePayment.address!
    const DEVICE_SCRIPT = devicePayment.output!

    /** A peg-in shaped PSBT: our input, federation output, OP_RETURN, change. */
    function buildPeginPsbt(): btc.Psbt {
      const psbt = new btc.Psbt({ network })
      psbt.setVersion(2)
      psbt.addInput({
        hash: Buffer.alloc(32, 7),
        index: 0,
        sequence: 0xffffffff,
        witnessUtxo: { script: DEVICE_SCRIPT, value: 200000 }
      })
      psbt.addOutput({
        script: btc.address.toOutputScript(FEDERATION_ADDRESS, network),
        value: 100000
      })
      psbt.addOutput({
        script: btc.script.compile([btc.opcodes['OP_RETURN']!, OP_RETURN_PAYLOAD]),
        value: 0
      })
      psbt.addOutput({ script: DEVICE_SCRIPT, value: 99000 })

      return psbt
    }

    /** What the device returns: the same transaction carrying a witness. */
    function buildSignedTxHex(psbt: btc.Psbt): string {
      const tx = new btc.Transaction()
      tx.version = 2
      psbt.txInputs.forEach(input => tx.addInput(input.hash, input.index, input.sequence))
      psbt.txOutputs.forEach(output => tx.addOutput(output.script, output.value))
      tx.setWitness(0, [DER_SIGNATURE, DEVICE_PUBKEY])

      return tx.toHex()
    }

    let testnetConnector: TrezorConnector

    beforeEach(async () => {
      testnetConnector = new TrezorConnector({
        requestedChains: [bitcoin, bitcoinTestnet],
        requestedCaipNetworkId: bitcoinTestnet.caipNetworkId
      })

      vi.mocked(TrezorConnect.getAddress).mockResolvedValueOnce({
        success: true,
        payload: [
          { address: DEVICE_ADDRESS, serializedPath: "m/84'/1'/0'/0/0" },
          { address: 'tb1qordinal', serializedPath: "m/84'/1'/0'/0/1" }
        ]
      } as never)

      await testnetConnector.connect()
    })

    async function signPeginPsbt() {
      const psbt = buildPeginPsbt()

      vi.mocked(TrezorConnect.signTransaction).mockResolvedValueOnce({
        success: true,
        payload: { serializedTx: buildSignedTxHex(psbt) }
      } as never)

      const response = await testnetConnector.signPSBT({
        psbt: psbt.toBase64(),
        signInputs: [],
        broadcast: false
      })

      const sent = vi.mocked(TrezorConnect.signTransaction).mock.calls[0]![0] as {
        inputs: Record<string, unknown>[]
        outputs: Record<string, unknown>[]
        coin: string
      }

      return { response, sent }
    }

    it('describes an OP_RETURN output as PAYTOOPRETURN with its payload', async () => {
      const { sent } = await signPeginPsbt()

      expect(sent.outputs[1]).toEqual({
        op_return_data: OP_RETURN_PAYLOAD.toString('hex'),
        amount: '0',
        script_type: 'PAYTOOPRETURN'
      })
    })

    it('describes a third-party P2SH output as PAYTOADDRESS', async () => {
      const { sent } = await signPeginPsbt()

      expect(sent.outputs[0]).toEqual({
        address: FEDERATION_ADDRESS,
        amount: '100000',
        script_type: 'PAYTOADDRESS'
      })
    })

    it('describes change back to our own address by derivation path', async () => {
      const { sent } = await signPeginPsbt()

      expect(sent.outputs[2]).toEqual({
        address_n: [2147483732, 2147483649, 2147483648, 0, 0],
        amount: '99000',
        script_type: 'PAYTOWITNESS'
      })
    })

    it('signs with the active network path and the real input amount', async () => {
      const { sent } = await signPeginPsbt()

      expect(sent.coin).toBe('test')
      expect(sent.inputs[0]).toMatchObject({
        // m/84'/1'/0'/0/0 — testnet, not the mainnet payment path
        address_n: [2147483732, 2147483649, 2147483648, 0, 0],
        amount: '200000',
        script_type: 'SPENDWITNESS'
      })
    })

    it('returns a signed PSBT carrying partialSig, which the caller can finalize', async () => {
      const { response } = await signPeginPsbt()

      const returned = btc.Psbt.fromBase64(response.psbt, { network })
      const input = returned.data.inputs[0]!

      expect(input.partialSig).toHaveLength(1)
      expect(input.partialSig![0]!.pubkey.equals(DEVICE_PUBKEY)).toBe(true)
      expect(input.partialSig![0]!.signature.equals(DER_SIGNATURE)).toBe(true)
      expect(input.finalScriptWitness).toBeUndefined()

      // Would previously throw "Can not finalize input #0".
      expect(() => returned.finalizeAllInputs()).not.toThrow()
    })

    it('derives the input amount from nonWitnessUtxo when there is no witnessUtxo', async () => {
      const prevTx = new btc.Transaction()
      prevTx.version = 2
      prevTx.addInput(Buffer.alloc(32, 1), 0)
      prevTx.addOutput(btc.address.toOutputScript(FEDERATION_ADDRESS, network), 123456)

      const psbt = new btc.Psbt({ network })
      psbt.addInput({ hash: prevTx.getHash(), index: 0, nonWitnessUtxo: prevTx.toBuffer() })
      psbt.addOutput({ script: DEVICE_SCRIPT, value: 100000 })

      vi.mocked(TrezorConnect.signTransaction).mockResolvedValueOnce({
        success: true,
        payload: { serializedTx: buildSignedTxHex(psbt) }
      } as never)

      await testnetConnector.signPSBT({ psbt: psbt.toBase64(), signInputs: [], broadcast: false })

      const sent = vi.mocked(TrezorConnect.signTransaction).mock.calls[0]![0] as {
        inputs: Record<string, unknown>[]
      }

      expect(sent.inputs[0]).toMatchObject({ amount: '123456', script_type: 'SPENDADDRESS' })
    })

    it('sends refTxs built from the PSBT so no backend lookup is needed', async () => {
      // A previous transaction paying our address, carried in the PSBT.
      const prevTx = new btc.Transaction()
      prevTx.version = 2
      prevTx.addInput(Buffer.alloc(32, 3), 0)
      prevTx.addOutput(DEVICE_SCRIPT, 200000)

      const psbt = new btc.Psbt({ network })
      psbt.addInput({
        hash: prevTx.getHash(),
        index: 0,
        witnessUtxo: { script: DEVICE_SCRIPT, value: 200000 },
        nonWitnessUtxo: prevTx.toBuffer()
      })
      psbt.addOutput({ script: DEVICE_SCRIPT, value: 190000 })

      vi.mocked(TrezorConnect.signTransaction).mockResolvedValueOnce({
        success: true,
        payload: { serializedTx: buildSignedTxHex(psbt) }
      } as never)

      await testnetConnector.signPSBT({ psbt: psbt.toBase64(), signInputs: [], broadcast: false })

      const sent = vi.mocked(TrezorConnect.signTransaction).mock.calls[0]![0] as {
        refTxs?: { hash: string; bin_outputs: { amount: string }[] }[]
      }

      expect(sent.refTxs).toHaveLength(1)
      expect(sent.refTxs![0]!.hash).toBe(prevTx.getId())
      expect(sent.refTxs![0]!.bin_outputs[0]!.amount).toBe('200000')
    })

    it('omits refTxs when the PSBT does not carry previous transactions', async () => {
      const { sent } = await signPeginPsbt()

      expect((sent as { refTxs?: unknown }).refTxs).toBeUndefined()
    })

    it('refuses an input whose amount cannot be determined', async () => {
      const psbt = new btc.Psbt({ network })
      psbt.addInput({ hash: Buffer.alloc(32, 7), index: 0 })
      psbt.addOutput({ script: DEVICE_SCRIPT, value: 1000 })

      await expect(
        testnetConnector.signPSBT({ psbt: psbt.toBase64(), signInputs: [], broadcast: false })
      ).rejects.toThrow('neither witnessUtxo nor nonWitnessUtxo')
    })
  })
})
