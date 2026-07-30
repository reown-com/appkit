import * as TrezorConnectWeb from '@trezor/connect-web'
import * as btc from 'bitcoinjs-lib'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'
import { CoreHelperUtil, type RequestArguments } from '@reown/appkit-controllers'
import type { BitcoinConnector } from '@reown/appkit-utils/bitcoin'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { MethodNotSupportedError } from '../../errors/MethodNotSupportedError.js'
import { AddressPurpose } from '../../utils/BitcoinConnector.js'
import { ProviderEventEmitter } from '../../utils/ProviderEventEmitter.js'
import type { TrezorConnector as TrezorConnectorTypes } from './types.js'

type TrezorConnectApi = typeof TrezorConnectWeb.default

/**
 * Builds a readable message from a failed TrezorConnect response. The `code` is
 * often the only part that identifies the cause (a missing previous
 * transaction, a rejected confirmation, an unreachable backend), so dropping it
 * leaves callers with nothing to act on.
 */
function describeTrezorFailure(
  fallback: string,
  payload: { error?: string; code?: string }
): string {
  const parts = [payload.error || fallback]

  if (payload.code) {
    parts.push(`(code: ${payload.code})`)
  }

  return parts.join(' ')
}

/**
 * `AccountAddress.purpose` is a string union rather than the AddressPurpose enum,
 * so comparisons need a value of the field's own type.
 */
const PAYMENT_PURPOSE = AddressPurpose.Payment as BitcoinConnector.AccountAddress['purpose']

let cachedTrezorConnect: TrezorConnectApi | undefined = undefined

/**
 * `@trezor/connect-web` is CommonJS and exposes its API as `exports.default`,
 * alongside `export *` named exports.
 *
 * Bundlers that honour the `__esModule` marker (webpack, Rollup, and Vite's
 * source transform) hand that object back as the default import. Node's ESM/CJS
 * interop does not: there, and under esbuild's node-mode interop — which Vite
 * uses when it prebundles this package as a dependency — the default import is
 * the whole `module.exports`, so the API sits one level deeper and
 * `TrezorConnect.init` is undefined.
 *
 * Probing for `init` covers every interop shape instead of assuming one. It is
 * deliberately lazy so that a bad resolution surfaces when the connector is
 * used rather than breaking the adapter's module import.
 */
function getTrezorConnect(): TrezorConnectApi {
  if (cachedTrezorConnect) {
    return cachedTrezorConnect
  }

  const namespace = TrezorConnectWeb as unknown as {
    default?: { default?: unknown } & Record<string, unknown>
  }

  const candidates = [namespace.default?.default, namespace.default, namespace]
  const resolved = candidates.find(
    candidate => typeof (candidate as TrezorConnectApi | undefined)?.init === 'function'
  )

  if (!resolved) {
    throw new Error(
      '@trezor/connect-web did not expose an init() method. This usually means the module was ' +
        'loaded through an interop path that hides its default export.'
    )
  }

  cachedTrezorConnect = resolved as TrezorConnectApi

  return cachedTrezorConnect
}

export class TrezorConnector extends ProviderEventEmitter implements BitcoinConnector {
  public readonly id = 'trezor'
  public readonly name = 'Trezor'
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'
  public readonly imageUrl =
    'https://pbs.twimg.com/profile_images/1876994745022529536/5FD_cxXO_400x400.jpg'

  public readonly provider = this

  private readonly requestedChains: CaipNetwork[] = []
  private currentNetwork: TrezorConnectorTypes.Network = 'Bitcoin'
  private initialized = false
  private connectedAddresses: BitcoinConnector.AccountAddress[] = []

  // Native SegWit derivation paths (BIP84)
  private readonly paymentPath = "m/84'/0'/0'/0/0"
  private readonly ordinalPath = "m/84'/0'/0'/0/1"

  // Testnet paths
  private readonly testnetPaymentPath = "m/84'/1'/0'/0/0"
  private readonly testnetOrdinalPath = "m/84'/1'/0'/0/1"

  /*
   * Signing requires the previous transaction of each input so the device can
   * verify the amounts it displays. A PSBT built from witness UTXOs alone does not
   * carry them, so TrezorConnect fetches them from a blockbook backend — and
   * without one registered for the active coin, signTransaction fails. These are
   * Trezor's public instances; override per network to use a self-hosted one.
   */
  private static readonly defaultBlockbookUrls: Record<TrezorConnectorTypes.Network, string[]> = {
    Bitcoin: ['https://btc1.trezor.io'],
    Testnet: ['https://tbtc1.trezor.io']
  }

  private readonly blockbookUrls: Record<TrezorConnectorTypes.Network, string[]>

  /** Coins whose backend has already been registered with TrezorConnect. */
  private readonly configuredBackends = new Set<string>()

  constructor({
    requestedChains,
    requestedCaipNetworkId,
    blockbookUrls
  }: TrezorConnectorTypes.ConstructorParams) {
    super()
    this.requestedChains = requestedChains
    this.blockbookUrls = { ...TrezorConnector.defaultBlockbookUrls, ...blockbookUrls }

    /*
     * Without this the connector stays on 'Bitcoin' until switchNetwork() is
     * called, so a testnet-only dapp silently receives mainnet addresses.
     */
    if (requestedCaipNetworkId) {
      this.currentNetwork = this.getNetworkFromCaipId(requestedCaipNetworkId)
    }
  }

  /** Payment path for the active network, never the mainnet constant. */
  private get activePaymentPath(): string {
    return this.currentNetwork === 'Testnet' ? this.testnetPaymentPath : this.paymentPath
  }

  /** Ordinal path for the active network. */
  private get activeOrdinalPath(): string {
    return this.currentNetwork === 'Testnet' ? this.testnetOrdinalPath : this.ordinalPath
  }

  public get chains() {
    return this.requestedChains.filter(
      chain => chain.chainNamespace === ConstantsUtil.CHAIN.BITCOIN
    )
  }

  public async connect(): Promise<string> {
    await this.initTrezor()

    const addresses = await this.getAccountAddresses()

    if (addresses.length === 0) {
      throw new Error('No addresses returned from Trezor')
    }

    this.connectedAddresses = addresses
    const paymentAddress = addresses.find(a => a.purpose === PAYMENT_PURPOSE)

    if (!paymentAddress) {
      throw new Error('No payment address found')
    }

    this.emit('accountsChanged', [paymentAddress.address])

    return paymentAddress.address
  }

  public async disconnect(): Promise<void> {
    this.connectedAddresses = []
    this.emit('disconnect')

    return Promise.resolve()
  }

  public async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    await this.initTrezor()

    const bundle = [
      { path: this.activePaymentPath, showOnTrezor: false, coin: this.getCoinName() },
      { path: this.activeOrdinalPath, showOnTrezor: false, coin: this.getCoinName() }
    ]

    const result = await getTrezorConnect().getAddress({ bundle })

    if (!result.success) {
      throw new Error(describeTrezorFailure('Failed to get addresses from Trezor', result.payload))
    }

    const addresses: BitcoinConnector.AccountAddress[] = result.payload.map((addr, index) => ({
      address: addr.address,
      publicKey: undefined,
      path: addr.serializedPath,
      purpose: index === 0 ? AddressPurpose.Payment : AddressPurpose.Ordinal
    }))

    this.connectedAddresses = addresses

    return addresses
  }

  public async signMessage(params: BitcoinConnector.SignMessageParams): Promise<string> {
    if (params.protocol === 'bip322') {
      throw new MethodNotSupportedError(
        this.id,
        'signMessage with BIP322 protocol',
        'Trezor only supports ECDSA signatures'
      )
    }

    await this.initTrezor()

    const addressInfo = this.connectedAddresses.find(a => a.address === params.address)
    const path = addressInfo?.path || this.getPathForAddress(params.address)

    const result = await getTrezorConnect().signMessage({
      path,
      message: params.message,
      coin: this.getCoinName()
    })

    if (!result.success) {
      throw new Error(describeTrezorFailure('Failed to sign message with Trezor', result.payload))
    }

    return result.payload.signature
  }

  public async sendTransfer(params: BitcoinConnector.SendTransferParams): Promise<string> {
    await this.initTrezor()

    const paymentAddress = this.connectedAddresses.find(a => a.purpose === PAYMENT_PURPOSE)

    if (!paymentAddress) {
      throw new Error('No payment address available')
    }

    const result = await getTrezorConnect().composeTransaction({
      outputs: [
        {
          type: 'payment',
          address: params.recipient,
          amount: params.amount
        }
      ],
      coin: this.getCoinName(),
      push: true
    })

    if (!result.success) {
      throw new Error(describeTrezorFailure('Failed to send transfer with Trezor', result.payload))
    }

    return result.payload.txid || ''
  }

  public async signPSBT(
    params: BitcoinConnector.SignPSBTParams
  ): Promise<BitcoinConnector.SignPSBTResponse> {
    await this.initTrezor()

    const network = this.currentNetwork === 'Testnet' ? btc.networks.testnet : btc.networks.bitcoin
    const psbt = btc.Psbt.fromBase64(params.psbt, { network })

    const inputs: TrezorConnectorTypes.TrezorInput[] = []
    const outputs: TrezorConnectorTypes.AnyTrezorOutput[] = []

    // Process inputs
    for (let i = 0; i < psbt.data.inputs.length; i += 1) {
      const input = psbt.data.inputs[i]
      const txInput = psbt.txInputs[i]

      if (!txInput) {
        throw new Error(`Missing transaction input at index ${i}`)
      }

      const signInput = params.signInputs.find(si => si.index === i)
      const prevHash = Buffer.from(txInput.hash).reverse().toString('hex')

      inputs.push({
        address_n: this.pathToArray(this.resolveInputPath(input, signInput)),
        prev_hash: prevHash,
        prev_index: txInput.index,
        amount: this.getInputAmount(input, txInput.index, i),
        script_type: this.getInputScriptType(input),
        sequence: txInput.sequence
      })
    }

    // Process outputs
    for (const output of psbt.txOutputs) {
      /*
       * OP_RETURN must be declared explicitly: it has no address, carries its
       * payload as hex and must have a zero amount. Detect it before attempting
       * address decoding, which throws for any non-address script.
       */
      const opReturnData = TrezorConnector.getOpReturnData(output.script)

      if (opReturnData === undefined) {
        const address = TrezorConnector.decodeOutputAddress(output.script, network)
        const addressInfo = this.connectedAddresses.find(a => a.address === address)

        if (addressInfo) {
          /*
           * Change back to one of our own addresses: identified by derivation
           * path. Our paths are BIP84, so the output is native SegWit.
           */
          outputs.push({
            address_n: this.pathToArray(addressInfo.path || this.activePaymentPath),
            amount: output.value.toString(),
            script_type: 'PAYTOWITNESS'
          })
        } else {
          /*
           * An output addressed to someone else. PAYTOADDRESS is the script type
           * that pairs with `address`; PAYTOWITNESS pairs with `address_n` and
           * would misdescribe P2SH/P2PKH recipients such as a peg-in federation.
           */
          outputs.push({
            address,
            amount: output.value.toString(),
            script_type: 'PAYTOADDRESS'
          })
        }
      } else {
        outputs.push({
          op_return_data: opReturnData,
          amount: '0',
          script_type: 'PAYTOOPRETURN'
        })
      }
    }

    /*
     * The device verifies the amount of every input against its previous
     * transaction. Supplying them from the PSBT keeps signing self-contained; when
     * they are absent TrezorConnect falls back to fetching them from the blockbook
     * backend, which requires the backend to serve the same chain as the PSBT.
     */
    const refTxs = TrezorConnector.buildRefTxs(psbt)

    const trezorConnect = getTrezorConnect()
    const result = await trezorConnect.signTransaction({
      inputs: inputs as Parameters<typeof trezorConnect.signTransaction>[0]['inputs'],
      outputs: outputs as Parameters<typeof trezorConnect.signTransaction>[0]['outputs'],
      ...(refTxs.length > 0
        ? { refTxs: refTxs as Parameters<typeof trezorConnect.signTransaction>[0]['refTxs'] }
        : {}),
      coin: this.getCoinName(),
      version: psbt.version,
      locktime: psbt.locktime
    })

    if (!result.success) {
      throw new Error(
        describeTrezorFailure('Failed to sign transaction with Trezor', result.payload)
      )
    }

    // Update PSBT with signatures
    const signedTx = btc.Transaction.fromHex(result.payload.serializedTx)

    /*
     * Return a *signed* PSBT rather than a finalized one. A P2WPKH witness is
     * [signature, publicKey], which maps directly onto `partialSig` — the shape
     * every other BitcoinConnector returns and the one consumers such as
     * bitcoinjs-lib's finalizeAllInputs() require. Writing only
     * finalScriptWitness left callers unable to finalize ("Can not finalize
     * input #0") because no partial signature was present.
     */
    for (let i = 0; i < psbt.data.inputs.length; i += 1) {
      const signedInput = signedTx.ins[i]
      const witness = signedInput?.witness ?? []
      const [signature, pubkey] = witness

      if (witness.length === 0) {
        // Nothing to graft: the device left this input unsigned.
      } else if (witness.length === 2 && signature?.length && pubkey?.length) {
        psbt.updateInput(i, { partialSig: [{ pubkey, signature }] })
      } else {
        /*
         * Multisig or script paths we cannot express as a single partialSig:
         * preserve the device's witness verbatim so the caller keeps a usable
         * transaction.
         */
        psbt.updateInput(i, {
          finalScriptWitness: this.witnessStackToScriptWitness(witness)
        })
      }
    }

    let txid: string | undefined = undefined
    if (params.broadcast) {
      const pushResult = await getTrezorConnect().pushTransaction({
        tx: result.payload.serializedTx,
        coin: this.getCoinName()
      })

      if (pushResult.success) {
        txid = pushResult.payload.txid
      }
    }

    return {
      psbt: psbt.toBase64(),
      txid
    }
  }

  public async switchNetwork(caipNetworkId: string): Promise<void> {
    const network = this.getNetworkFromCaipId(caipNetworkId)
    this.currentNetwork = network

    // The new coin needs its own backend before it can be signed for.
    await this.configureBackend()

    // Re-fetch addresses for the new network
    this.connectedAddresses = await this.getAccountAddresses()

    this.emit('chainChanged', caipNetworkId)
  }

  public request<T>(_args: RequestArguments): Promise<T> {
    return Promise.reject(new MethodNotSupportedError(this.id, 'request'))
  }

  // -- Static Methods ----------------------------------------- //

  public static getWallet(
    params: TrezorConnectorTypes.GetWalletParams
  ): TrezorConnector | undefined {
    if (!CoreHelperUtil.isClient()) {
      return undefined
    }

    // Trezor uses a popup flow, so it's always available in browser environments
    return new TrezorConnector(params)
  }

  // -- Private Methods ---------------------------------------- //

  private async initTrezor(): Promise<void> {
    if (this.initialized) {
      return
    }

    await getTrezorConnect().init({
      manifest: {
        email: 'support@reown.com',
        appUrl: typeof window === 'undefined' ? 'https://reown.com' : window.location.origin,
        appName: 'Reown AppKit'
      },
      lazyLoad: true,
      popup: true
    })

    this.initialized = true

    await this.configureBackend()
  }

  /**
   * Registers the blockbook backend for the active coin so TrezorConnect can
   * retrieve the previous transactions it needs to verify inputs. Failures are
   * non-fatal: signing may still succeed when the caller supplies everything the
   * device needs, and a hard failure here would block connecting entirely.
   */
  private async configureBackend(): Promise<void> {
    const coin = this.getCoinName()

    if (this.configuredBackends.has(coin)) {
      return
    }

    const url = this.blockbookUrls[this.currentNetwork]

    if (!url?.length) {
      return
    }

    this.configuredBackends.add(coin)

    await getTrezorConnect()
      .blockchainSetCustomBackend({ coin, blockchainLink: { type: 'blockbook', url } })
      .catch(() => {
        this.configuredBackends.delete(coin)
      })
  }

  private getCoinName(): string {
    return this.currentNetwork === 'Bitcoin' ? 'btc' : 'test'
  }

  private getNetworkFromCaipId(caipNetworkId: string): TrezorConnectorTypes.Network {
    switch (caipNetworkId) {
      case bitcoin.caipNetworkId:
        return 'Bitcoin'
      case bitcoinTestnet.caipNetworkId:
        return 'Testnet'
      default:
        /*
         * Never silently fall back to mainnet: doing so would derive mainnet keys
         * and ask the user to sign a mainnet transaction on an unsupported
         * network such as signet or regtest.
         */
        throw new Error(
          `Unsupported Bitcoin network for Trezor: ${caipNetworkId}. ` +
            'Only Bitcoin mainnet and testnet are supported.'
        )
    }
  }

  private getPathForAddress(_address: string): string {
    return this.activePaymentPath
  }

  /**
   * The derivation path to sign an input with. Explicit `signInputs` win, then
   * the PSBT's own `bip32Derivation`, and only then the account's payment path
   * for the *active* network — never the mainnet constant.
   */
  private resolveInputPath(
    input: btc.Psbt['data']['inputs'][number] | undefined,
    signInput: BitcoinConnector.SignPSBTParams['signInputs'][number] | undefined
  ): string {
    if (signInput?.address) {
      const addressInfo = this.connectedAddresses.find(a => a.address === signInput.address)

      return addressInfo?.path || this.getPathForAddress(signInput.address)
    }

    if (signInput?.publicKey) {
      const addressInfo = this.connectedAddresses.find(a => a.publicKey === signInput.publicKey)

      return addressInfo?.path || this.activePaymentPath
    }

    return input?.bip32Derivation?.[0]?.path || this.activePaymentPath
  }

  /**
   * Reference transactions for every input that carries its previous transaction
   * in the PSBT (`nonWitnessUtxo`). Deduplicated by txid, since several inputs can
   * spend the same parent. Returns an empty array when the PSBT has none, leaving
   * TrezorConnect to fetch them from the configured backend.
   */
  private static buildRefTxs(psbt: btc.Psbt): TrezorConnectorTypes.TrezorRefTransaction[] {
    const byTxid = new Map<string, TrezorConnectorTypes.TrezorRefTransaction>()

    psbt.data.inputs.forEach(input => {
      if (!input.nonWitnessUtxo) {
        return
      }

      const tx = btc.Transaction.fromBuffer(Buffer.from(input.nonWitnessUtxo))
      const hash = tx.getId()

      if (byTxid.has(hash)) {
        return
      }

      byTxid.set(hash, {
        hash,
        version: tx.version,
        lock_time: tx.locktime,
        inputs: tx.ins.map(txInput => ({
          prev_hash: Buffer.from(txInput.hash).reverse().toString('hex'),
          prev_index: txInput.index,
          script_sig: Buffer.from(txInput.script).toString('hex'),
          sequence: txInput.sequence
        })),
        bin_outputs: tx.outs.map(txOutput => ({
          amount: txOutput.value.toString(),
          script_pubkey: Buffer.from(txOutput.script).toString('hex')
        }))
      })
    })

    return [...byTxid.values()]
  }

  /**
   * Decodes an output script to an address, failing loudly for scripts we cannot
   * describe to the device. Sending an empty address instead would have the user
   * approve something other than what the caller asked for.
   */
  private static decodeOutputAddress(script: Uint8Array, network: btc.Network): string {
    try {
      return btc.address.fromOutputScript(Buffer.from(script), network)
    } catch {
      throw new Error(`Unsupported output script in PSBT: ${Buffer.from(script).toString('hex')}`)
    }
  }

  /**
   * Returns the OP_RETURN payload as hex, or undefined when the script is not an
   * OP_RETURN. Multiple pushes are concatenated, matching how the data was laid
   * out by the caller.
   */
  private static getOpReturnData(script: Uint8Array): string | undefined {
    let chunks: (number | Buffer)[] | null = null

    try {
      chunks = btc.script.decompile(Buffer.from(script))
    } catch {
      return undefined
    }

    if (!chunks?.length || chunks[0] !== btc.opcodes['OP_RETURN']) {
      return undefined
    }

    return chunks
      .slice(1)
      .filter((chunk): chunk is Buffer => Buffer.isBuffer(chunk))
      .map(chunk => chunk.toString('hex'))
      .join('')
  }

  /**
   * The value being spent, which the device needs to compute fees. A PSBT input
   * carries it either directly (witnessUtxo) or inside the full previous
   * transaction (nonWitnessUtxo).
   */
  private getInputAmount(
    input: btc.Psbt['data']['inputs'][number] | undefined,
    prevIndex: number,
    inputIndex: number
  ): string {
    if (input?.witnessUtxo) {
      return input.witnessUtxo.value.toString()
    }

    if (input?.nonWitnessUtxo) {
      const prevTx = btc.Transaction.fromBuffer(Buffer.from(input.nonWitnessUtxo))
      const prevOut = prevTx.outs[prevIndex]

      if (!prevOut) {
        throw new Error(
          `PSBT input ${inputIndex} references output ${prevIndex}, which does not exist`
        )
      }

      return prevOut.value.toString()
    }

    /*
     * Defaulting to '0' here would make the device compute and display a wrong
     * fee for a transaction the user is about to approve.
     */
    throw new Error(
      `PSBT input ${inputIndex} has neither witnessUtxo nor nonWitnessUtxo, so its ` +
        'amount cannot be determined'
    )
  }

  /** Maps the input's script to the spend type the device expects. */
  private getInputScriptType(
    input: btc.Psbt['data']['inputs'][number] | undefined
  ): TrezorConnectorTypes.InputScriptType {
    if (input?.witnessUtxo) {
      if (input.redeemScript) {
        return 'SPENDP2SHWITNESS'
      }

      if (input.witnessScript) {
        return 'SPENDMULTISIG'
      }

      const script = Buffer.from(input.witnessUtxo.script)

      // P2TR: OP_1 <32-byte push>
      if (script.length === 34 && script[0] === btc.opcodes['OP_1'] && script[1] === 0x20) {
        return 'SPENDTAPROOT'
      }

      return 'SPENDWITNESS'
    }

    // No witness UTXO means a legacy (P2PKH) input.
    return 'SPENDADDRESS'
  }

  private pathToArray(path: string): number[] {
    // Convert path like "m/84'/0'/0'/0/0" to array [2147483732, 2147483648, 2147483648, 0, 0]
    return path
      .replace('m/', '')
      .split('/')
      .map(part => {
        const isHardened = part.endsWith("'")
        const index = parseInt(isHardened ? part.slice(0, -1) : part, 10)

        return isHardened ? index + 0x80000000 : index
      })
  }

  private witnessStackToScriptWitness(witness: Buffer[]): Buffer {
    let buffer = Buffer.alloc(0)

    function writeSlice(slice: Buffer) {
      buffer = Buffer.concat([buffer, slice])
    }

    function writeVarInt(n: number) {
      if (n < 0xfd) {
        writeSlice(Buffer.from([n]))
      } else if (n <= 0xffff) {
        const buf = Buffer.alloc(3)
        buf.writeUInt8(0xfd, 0)
        buf.writeUInt16LE(n, 1)
        writeSlice(buf)
      } else if (n <= 0xffffffff) {
        const buf = Buffer.alloc(5)
        buf.writeUInt8(0xfe, 0)
        buf.writeUInt32LE(n, 1)
        writeSlice(buf)
      } else {
        const buf = Buffer.alloc(9)
        buf.writeUInt8(0xff, 0)
        buf.writeUInt32LE(n >>> 0, 1)
        buf.writeUInt32LE(Math.floor(n / 0x100000000), 5)
        writeSlice(buf)
      }
    }

    function writeVarSlice(slice: Buffer) {
      writeVarInt(slice.length)
      writeSlice(slice)
    }

    function writeVector(vector: Buffer[]) {
      writeVarInt(vector.length)
      vector.forEach(writeVarSlice)
    }

    writeVector(witness)

    return buffer
  }
}
