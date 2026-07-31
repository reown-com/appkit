import TrezorConnect from '@trezor/connect-web'
import {
  getXpubOrDescriptorInfo,
  address as trezorAddress,
  networks as trezorNetworks
} from '@trezor/utxo-lib'
import * as btc from 'bitcoinjs-lib'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CoreHelperUtil } from '@reown/appkit-controllers'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { TrezorConnector } from '../../src/connectors/TrezorConnector'
import { MethodNotSupportedError } from '../../src/errors/MethodNotSupportedError'

/*
 * Account descriptors for a fixed seed, one per script type. Deriving from these
 * produces the real addresses asserted below, so the tests exercise the actual
 * derivation rather than a stand-in.
 *
 * Taproot is an output descriptor rather than a bare xpub: a BIP86 xpub carries
 * the same version bytes as a BIP44 one, so only the tr(...) form identifies it.
 */
const TESTNET_DESCRIPTORS = {
  p2pkh:
    'tpubDCmvdkV6xU5iR6ojqHrX2bXaidnG4mF143VDhqkS4NFjTzVN8idqTpQxtmxzCGnhCjzmEoa3gZpWeZgrC4ZkjRhStPyYZcbkKSmSeSHubr6',
  p2sh: 'upub5DM9NTt3ZDbgPxNSGAAzAbETrffykGZ7pjP8yFC2X4fhz7x3Yh3THr9HxKXz69hm1xWoV74nQDWXgW1QjCGAmfVxfgdoDYvcZqfN6wqk72Q',
  p2wpkh:
    'vpub5YVQaGsAxpzkuMQcWTD1F2q9CuxukAFMoDXGZD2nrRRvV9od2cEjrtMMxCnvXohcRF9x6swm8GwMYQKo1n3CFL3wcZW7CUk6Nfq1x1SRU3D',
  p2tr: "tr([4ba43603/86'/1'/0']tpubDDbBZ6nxNvbeBeodf2JnUjRqPzQaLZLgV585T2uxFWFX4NLBkxK2hHNMwPxtNoBqbCHwSNci6sgqZzU4h6MydLLw2n9Z2uQhREMzha3YHVH/<0;1>/*)"
} as const

const MAINNET_DESCRIPTORS = {
  p2pkh:
    'xpub6DDeqdmzCpioRhR7fgHQAibbTMNRcPnW1qcYrrtAR5YEAWztVK3G6HuAky6Y3mZzB4UCqVifkXFY2qBUv8rJCHiT1JfoCLtUerZYp653yss',
  p2sh: 'ypub6XZGfqAJwhqmsvi6iwBJ3fJxRDjkb6wn126YUgQnp3acEkpvbHJuDuevBq9V1UBjCq85P64z6bXyEKsL3Lsf2Zx9U4LaY9TPEp8TxuqDiBv',
  p2wpkh:
    'zpub6qvRHJQEqEKSCfb8Lwh1ypCMGoHySB6cixgR91DjtA4Pp6boXFanP2rJE3tU38514x5u8tJEcZRynDpcyM14ETFTucDzwb3Ga4FL36cDWPY',
  p2tr: "tr([4ba43603/86'/0'/0']xpub6CgE2jCga4edMze1FydMVNpvW8vbvTU5ZcQXzvuBdf1s4fAC8prqBpn7gm3egwn6oQzJxvh4XChCma3LXE5EJ6kGo3wGmuxLd4yvQgU7ykD/<0;1>/*)"
} as const

const SCRIPT_TYPE_ORDER = ['p2pkh', 'p2sh', 'p2wpkh', 'p2tr'] as const

/** Addresses these descriptors derive, used as expectations throughout. */
const TESTNET = {
  paymentAddress: 'tb1q022amqf3jv7mg744rcjmst222dfazqvm72jgzc',
  paymentPublicKey: '038b7479652d8f0cda05450f45d849785a442f8ab68298baf2180fb1da80fcd579',
  ordinalAddress: 'tb1qnvjzyemddh93zmjcf20rz50jzra2tvwqk6rmsq',
  ordinalPublicKey: '03d492ce1d7a10352d0b19dd3e9fc5d28d9dcb101de2426646f1a93a039059f245',
  changeAddress: 'tb1qlfr2dxd9n8wvgtt2t39atsvd4luxrk8vnvkf0m',
  taprootChangeAddress: 'tb1pagdnm5rjp2cvxmlq0azn9ugrdt7n9mjfezz7phzduv7ccutf7elqsa2e89',
  legacyReceiveAddress: 'miPxvemrTyp2h7ut17BZyrmyfqG3jafXTe',
  nestedReceiveAddress: '2Mzt6RBL4rZAv1KCe9bz59n7BdX8xzszBSp'
} as const

/** Builds the bundled getPublicKey payload TrezorConnect would return. */
function publicKeyPayload(descriptors: Record<string, string>, coinType: number) {
  return SCRIPT_TYPE_ORDER.map(scriptType => {
    const purpose = { p2pkh: 44, p2sh: 49, p2wpkh: 84, p2tr: 86 }[scriptType]

    return {
      // The connector prefers xpubSegwit, matching TrezorConnect's own precedence.
      xpubSegwit: descriptors[scriptType],
      xpub: descriptors[scriptType],
      serializedPath: `m/${purpose}'/${coinType}'/0'`
    }
  })
}

function mockPublicKeys(descriptors: Record<string, string>, coinType: number) {
  vi.mocked(TrezorConnect.getPublicKey).mockResolvedValue({
    success: true,
    payload: publicKeyPayload(descriptors, coinType)
  } as never)
}

vi.mock('@trezor/connect-web', () => ({
  default: {
    init: vi.fn(() => Promise.resolve()),
    getPublicKey: vi.fn(),
    getAddress: vi.fn(),
    signMessage: vi.fn(() =>
      Promise.resolve({ success: true, payload: { signature: 'mock_signature' } })
    ),
    composeTransaction: vi.fn(() =>
      Promise.resolve({ success: true, payload: { txid: 'mock_txid' } })
    ),
    signTransaction: vi.fn(() => Promise.resolve({ success: true, payload: { serializedTx: '' } })),
    pushTransaction: vi.fn(() =>
      Promise.resolve({ success: true, payload: { txid: 'mock_broadcast_txid' } })
    ),
    blockchainSetCustomBackend: vi.fn(() => Promise.resolve({ success: true, payload: true }))
  }
}))

describe('TrezorConnector', () => {
  let connector: TrezorConnector

  function newTestnetConnector(
    params: Partial<{ blockbookUrls: Record<string, string[]> }> = {}
  ): TrezorConnector {
    return new TrezorConnector({
      requestedChains: [bitcoin, bitcoinTestnet],
      requestedCaipNetworkId: bitcoinTestnet.caipNetworkId,
      ...params
    } as never)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockPublicKeys(TESTNET_DESCRIPTORS, 1)
    connector = newTestnetConnector()
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

  describe('descriptor fixtures', () => {
    /*
     * Guards the trap that makes this whole approach fragile: a bare BIP86 xpub
     * carries the same version bytes as a BIP44 one, so a derivation library
     * reading version bytes alone silently produces legacy P2PKH addresses for a
     * taproot account. If a fixture ever degrades to a bare xpub, this fails
     * here rather than handing users addresses of the wrong type.
     */
    it.each(SCRIPT_TYPE_ORDER)('resolves the %s testnet descriptor to its own type', scriptType => {
      const { paymentType } = getXpubOrDescriptorInfo(
        TESTNET_DESCRIPTORS[scriptType],
        trezorNetworks.testnet
      )

      expect(paymentType).toBe(scriptType)
    })

    it.each(SCRIPT_TYPE_ORDER)('resolves the %s mainnet descriptor to its own type', scriptType => {
      const { paymentType } = getXpubOrDescriptorInfo(
        MAINNET_DESCRIPTORS[scriptType],
        trezorNetworks.bitcoin
      )

      expect(paymentType).toBe(scriptType)
    })
  })

  describe('single device interaction', () => {
    it('asks the device for extended keys exactly once across repeated calls', async () => {
      await connector.connect()
      await connector.getAccountAddresses()
      await connector.getAccountAddresses()
      await connector.getDerivedAddresses()

      expect(TrezorConnect.getPublicKey).toHaveBeenCalledTimes(1)
    })

    it('never falls back to per-address getAddress calls', async () => {
      await connector.connect()
      await connector.getDerivedAddresses()

      expect(TrezorConnect.getAddress).not.toHaveBeenCalled()
    })

    it('requests all four accounts in one bundle', async () => {
      await connector.getAccountAddresses()

      const { bundle } = vi.mocked(TrezorConnect.getPublicKey).mock.calls[0]![0] as {
        bundle: { path: string; coin: string }[]
      }

      expect(bundle.map(entry => entry.path)).toEqual([
        "m/44'/1'/0'",
        "m/49'/1'/0'",
        "m/84'/1'/0'",
        "m/86'/1'/0'"
      ])
      expect(bundle.every(entry => entry.coin === 'test')).toBe(true)
    })

    it('shares one device call between concurrent callers', async () => {
      await Promise.all([
        connector.getAccountAddresses(),
        connector.getAccountAddresses(),
        connector.getDerivedAddresses()
      ])

      expect(TrezorConnect.getPublicKey).toHaveBeenCalledTimes(1)
    })

    it('re-fetches after disconnect, since the cache is cleared', async () => {
      await connector.connect()
      await connector.disconnect()
      await connector.getAccountAddresses()

      expect(TrezorConnect.getPublicKey).toHaveBeenCalledTimes(2)
    })
  })

  describe('connect', () => {
    it('should connect and return payment address', async () => {
      expect(await connector.connect()).toBe(TESTNET.paymentAddress)
    })

    it('should emit accountsChanged on connect', async () => {
      const listener = vi.fn()
      connector.on('accountsChanged', listener)
      await connector.connect()

      expect(listener).toHaveBeenCalledWith([TESTNET.paymentAddress])
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
    /*
     * The adapter collapses this to exactly two accounts by position
     * (BitcoinConstantsUtil.ACCOUNT_INDEXES), so the contract must stay at two
     * entries, payment first, no matter how many addresses are derived.
     */
    it('returns exactly two addresses, payment first', async () => {
      const addresses = await connector.getAccountAddresses()

      expect(addresses).toHaveLength(2)
      expect(addresses[0]).toEqual({
        address: TESTNET.paymentAddress,
        publicKey: TESTNET.paymentPublicKey,
        path: "m/84'/1'/0'/0/0",
        purpose: 'payment'
      })
      expect(addresses[1]).toEqual({
        address: TESTNET.ordinalAddress,
        publicKey: TESTNET.ordinalPublicKey,
        path: "m/84'/1'/0'/0/1",
        purpose: 'ordinal'
      })
    })

    it('populates publicKey, which was previously always undefined', async () => {
      const addresses = await connector.getAccountAddresses()

      expect(addresses.every(a => typeof a.publicKey === 'string' && a.publicKey.length > 0)).toBe(
        true
      )
    })
  })

  describe('getDerivedAddresses', () => {
    it('derives every script type on both chains', async () => {
      const derived = await connector.getDerivedAddresses()

      expect(derived).toHaveLength(SCRIPT_TYPE_ORDER.length * 2 * 20)

      for (const scriptType of SCRIPT_TYPE_ORDER) {
        for (const chain of ['receive', 'change'] as const) {
          const matching = derived.filter(a => a.scriptType === scriptType && a.chain === chain)

          expect(matching).toHaveLength(20)
          expect(matching.map(a => a.index)).toEqual([...Array(20).keys()])
        }
      }
    })

    it('derives the expected address for each script type', async () => {
      const derived = await connector.getDerivedAddresses()
      const receiveZero = (scriptType: string) =>
        derived.find(a => a.scriptType === scriptType && a.chain === 'receive' && a.index === 0)
          ?.address

      expect(receiveZero('p2pkh')).toBe(TESTNET.legacyReceiveAddress)
      expect(receiveZero('p2sh')).toBe(TESTNET.nestedReceiveAddress)
      expect(receiveZero('p2wpkh')).toBe(TESTNET.paymentAddress)
      expect(receiveZero('p2tr')).toBe(
        'tb1pslfsgllyu4wqjpa9lr0nyv57k6q8dj72akdz5qfvs84fhhehp45sa95z2q'
      )
    })

    it('carries a public key and a well-formed path for every address', async () => {
      const derived = await connector.getDerivedAddresses()

      expect(
        derived.every(a => /^[0-9a-f]{66}$/u.test(a.publicKey) && /^m(?:\/\d+'?){5}$/u.test(a.path))
      ).toBe(true)
    })

    it('exposes the account descriptors', async () => {
      expect(await connector.getAccountDescriptors()).toEqual(TESTNET_DESCRIPTORS)
    })
  })

  describe('signMessage', () => {
    beforeEach(async () => {
      await connector.connect()
    })

    it('should sign a message with ecdsa', async () => {
      const signature = await connector.signMessage({
        address: TESTNET.paymentAddress,
        message: 'test message',
        protocol: 'ecdsa'
      })

      expect(signature).toBe('mock_signature')
    })

    it('signs with the derivation path of the requested address', async () => {
      await connector.signMessage({
        address: TESTNET.changeAddress,
        message: 'test message'
      })

      expect(TrezorConnect.signMessage).toHaveBeenCalledWith(
        expect.objectContaining({ path: "m/84'/1'/0'/1/0" })
      )
    })

    it('should throw error for bip322 protocol', async () => {
      await expect(
        connector.signMessage({
          address: TESTNET.paymentAddress,
          message: 'test message',
          protocol: 'bip322'
        })
      ).rejects.toThrow(MethodNotSupportedError)
    })
  })

  describe('sendTransfer', () => {
    it('should send a transfer', async () => {
      await connector.connect()

      expect(await connector.sendTransfer({ amount: '100000', recipient: 'tb1qrecipient' })).toBe(
        'mock_txid'
      )
    })
  })

  describe('switchNetwork', () => {
    it('re-fetches keys when the coin type changes', async () => {
      await connector.getAccountAddresses()
      mockPublicKeys(MAINNET_DESCRIPTORS, 0)

      const listener = vi.fn()
      connector.on('chainChanged', listener)
      await connector.switchNetwork(bitcoin.caipNetworkId)

      expect(TrezorConnect.getPublicKey).toHaveBeenCalledTimes(2)
      expect(listener).toHaveBeenCalledWith(bitcoin.caipNetworkId)
    })

    it('derives mainnet addresses after switching to mainnet', async () => {
      await connector.getAccountAddresses()
      mockPublicKeys(MAINNET_DESCRIPTORS, 0)
      await connector.switchNetwork(bitcoin.caipNetworkId)

      const [payment] = await connector.getAccountAddresses()

      expect(payment!.path).toBe("m/84'/0'/0'/0/0")
      expect(payment!.address.startsWith('bc1q')).toBe(true)
    })

    it('does not re-fetch when switching to the network already in use', async () => {
      await connector.getAccountAddresses()
      await connector.switchNetwork(bitcoinTestnet.caipNetworkId)

      expect(TrezorConnect.getPublicKey).toHaveBeenCalledTimes(1)
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

      expect(
        TrezorConnector.getWallet({ requestedChains: [bitcoin, bitcoinTestnet] })
      ).toBeUndefined()
    })

    it('should return TrezorConnector instance in browser', () => {
      vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)

      expect(
        TrezorConnector.getWallet({ requestedChains: [bitcoin, bitcoinTestnet] })
      ).toBeInstanceOf(TrezorConnector)
    })
  })

  describe('active network', () => {
    it('registers the testnet blockbook backend so inputs can be verified', async () => {
      await connector.getAccountAddresses()

      expect(TrezorConnect.blockchainSetCustomBackend).toHaveBeenCalledWith({
        coin: 'test',
        blockchainLink: { type: 'blockbook', url: ['https://tbtc1.trezor.io'] }
      })
    })

    it('allows the blockbook endpoint to be overridden', async () => {
      const overridden = newTestnetConnector({
        blockbookUrls: { Testnet: ['https://blockbook.internal'] }
      })

      await overridden.getAccountAddresses()

      expect(TrezorConnect.blockchainSetCustomBackend).toHaveBeenCalledWith({
        coin: 'test',
        blockchainLink: { type: 'blockbook', url: ['https://blockbook.internal'] }
      })
    })

    it('registers the backend only once per coin', async () => {
      await connector.getAccountAddresses()
      await connector.getAccountAddresses()

      expect(TrezorConnect.blockchainSetCustomBackend).toHaveBeenCalledTimes(1)
    })

    it('still connects when the backend cannot be registered', async () => {
      vi.mocked(TrezorConnect.blockchainSetCustomBackend).mockRejectedValueOnce(
        new Error('backend unreachable')
      )

      await expect(newTestnetConnector().getAccountAddresses()).resolves.toHaveLength(2)
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

    it('rejects an extended key whose type does not match the account requested', async () => {
      // A bare BIP86 xpub reads as p2pkh, which would yield legacy addresses.
      vi.mocked(TrezorConnect.getPublicKey).mockResolvedValue({
        success: true,
        payload: publicKeyPayload({ ...TESTNET_DESCRIPTORS, p2tr: TESTNET_DESCRIPTORS.p2pkh }, 1)
      } as never)

      await expect(newTestnetConnector().getAccountAddresses()).rejects.toThrow(
        /returned a p2pkh extended key for the p2tr account/u
      )
    })
  })

  describe('signPSBT', () => {
    // Minimal canonical DER signature (r = s = 1) plus SIGHASH_ALL.
    const DER_SIGNATURE = Buffer.from('3006020101020101' + '01', 'hex')
    // Testnet P2SH — the shape of a Rootstock peg-in federation address.
    const FEDERATION_ADDRESS = '2N2PJEucf6QY2kNFuJ4chQEBoyZWszRQE16'
    const OP_RETURN_PAYLOAD = Buffer.from('52534b5401' + '11'.repeat(20), 'hex')

    const DEVICE_PUBKEY = Buffer.from(TESTNET.paymentPublicKey, 'hex')
    const network = btc.networks.testnet
    const DEVICE_SCRIPT = btc.payments.p2wpkh({ pubkey: DEVICE_PUBKEY, network }).output!
    const CHANGE_SCRIPT = btc.address.toOutputScript(TESTNET.changeAddress, network)

    /** A peg-in shaped PSBT: our input, federation output, OP_RETURN, change. */
    function buildPeginPsbt(changeScript: Uint8Array = CHANGE_SCRIPT): btc.Psbt {
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
      psbt.addOutput({ script: Buffer.from(changeScript), value: 99000 })

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

    beforeEach(async () => {
      await connector.connect()
    })

    async function signPsbt(psbt: btc.Psbt) {
      vi.mocked(TrezorConnect.signTransaction).mockResolvedValueOnce({
        success: true,
        payload: { serializedTx: buildSignedTxHex(psbt) }
      } as never)

      const response = await connector.signPSBT({
        psbt: psbt.toBase64(),
        signInputs: [],
        broadcast: false
      })

      const sent = vi.mocked(TrezorConnect.signTransaction).mock.calls[0]![0] as {
        inputs: Record<string, unknown>[]
        outputs: Record<string, unknown>[]
        coin: string
        refTxs?: { hash: string; bin_outputs: { amount: string }[] }[]
      }

      return { response, sent }
    }

    const signPeginPsbt = () => signPsbt(buildPeginPsbt())

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

    /*
     * Change lives on the change chain (.../1/*), which the connector previously
     * could not derive — so real BIP84 change was shown to the user as a payment
     * to a stranger.
     */
    it('recognises change on the change chain by derivation path', async () => {
      const { sent } = await signPeginPsbt()

      expect(sent.outputs[2]).toEqual({
        // m/84'/1'/0'/1/0
        address_n: [2147483732, 2147483649, 2147483648, 1, 0],
        amount: '99000',
        script_type: 'PAYTOWITNESS'
      })
    })

    it('uses the script type matching the change address, not always PAYTOWITNESS', async () => {
      /*
       * Built with @trezor/utxo-lib because bitcoinjs-lib throws "No ECC Library
       * provided" for taproot unless initEccLib() has been called — the same
       * reason the connector decodes output scripts with utxo-lib.
       */
      const taprootChange = trezorAddress.toOutputScript(
        TESTNET.taprootChangeAddress,
        trezorNetworks.testnet
      )
      const { sent } = await signPsbt(buildPeginPsbt(taprootChange))

      expect(sent.outputs[2]).toEqual({
        // m/86'/1'/0'/1/0
        address_n: [2147483734, 2147483649, 2147483648, 1, 0],
        amount: '99000',
        script_type: 'PAYTOTAPROOT'
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

    it('resolves an input path from signInputs by address', async () => {
      const psbt = buildPeginPsbt()

      vi.mocked(TrezorConnect.signTransaction).mockResolvedValueOnce({
        success: true,
        payload: { serializedTx: buildSignedTxHex(psbt) }
      } as never)

      await connector.signPSBT({
        psbt: psbt.toBase64(),
        signInputs: [{ index: 0, address: TESTNET.changeAddress, sighashTypes: [] }],
        broadcast: false
      })

      const sent = vi.mocked(TrezorConnect.signTransaction).mock.calls[0]![0] as {
        inputs: Record<string, unknown>[]
      }

      expect(sent.inputs[0]).toMatchObject({
        address_n: [2147483732, 2147483649, 2147483648, 1, 0]
      })
    })

    /*
     * publicKey used to be undefined on every address, so this branch of
     * resolveInputPath could never match anything. SignPSBTParams types
     * `address` as required but documents it as "at least specify either an
     * address or a public key", so the publicKey-only shape is reachable from
     * untyped callers — hence the cast.
     */
    it('resolves an input path from signInputs by public key', async () => {
      const psbt = buildPeginPsbt()

      vi.mocked(TrezorConnect.signTransaction).mockResolvedValueOnce({
        success: true,
        payload: { serializedTx: buildSignedTxHex(psbt) }
      } as never)

      await connector.signPSBT({
        psbt: psbt.toBase64(),
        signInputs: [{ index: 0, publicKey: TESTNET.ordinalPublicKey }] as never,
        broadcast: false
      })

      const sent = vi.mocked(TrezorConnect.signTransaction).mock.calls[0]![0] as {
        inputs: Record<string, unknown>[]
      }

      expect(sent.inputs[0]).toMatchObject({
        // m/84'/1'/0'/0/1
        address_n: [2147483732, 2147483649, 2147483648, 0, 1]
      })
    })

    it('refuses to sign an address it cannot place, rather than using .../0/0', async () => {
      const psbt = buildPeginPsbt()

      await expect(
        connector.signPSBT({
          psbt: psbt.toBase64(),
          signInputs: [
            {
              index: 0,
              address: 'tb1qnotours000000000000000000000000000000',
              sighashTypes: []
            }
          ],
          broadcast: false
        })
      ).rejects.toThrow(/was not derived from this Trezor account/u)
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

      const { sent } = await signPsbt(psbt)

      expect(sent.inputs[0]).toMatchObject({ amount: '123456', script_type: 'SPENDWITNESS' })
    })

    it('sends refTxs built from the PSBT so no backend lookup is needed', async () => {
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

      const { sent } = await signPsbt(psbt)

      expect(sent.refTxs).toHaveLength(1)
      expect(sent.refTxs![0]!.hash).toBe(prevTx.getId())
      expect(sent.refTxs![0]!.bin_outputs[0]!.amount).toBe('200000')
    })

    it('omits refTxs when the PSBT does not carry previous transactions', async () => {
      const { sent } = await signPeginPsbt()

      expect(sent.refTxs).toBeUndefined()
    })

    it('refuses an input whose amount cannot be determined', async () => {
      const psbt = new btc.Psbt({ network })
      psbt.addInput({ hash: Buffer.alloc(32, 7), index: 0 })
      psbt.addOutput({ script: DEVICE_SCRIPT, value: 1000 })

      await expect(
        connector.signPSBT({ psbt: psbt.toBase64(), signInputs: [], broadcast: false })
      ).rejects.toThrow('neither witnessUtxo nor nonWitnessUtxo')
    })
  })
})
