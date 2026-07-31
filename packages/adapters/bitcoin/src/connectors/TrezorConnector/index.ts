import * as TrezorConnectWeb from '@trezor/connect-web'
import {
  deriveAddresses,
  getXpubOrDescriptorInfo,
  address as trezorAddress,
  networks as trezorNetworks
} from '@trezor/utxo-lib'
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

/** Script types we derive an account for, in the order they are requested. */
const SCRIPT_TYPES: readonly TrezorConnectorTypes.BitcoinScriptType[] = [
  'p2pkh',
  'p2sh',
  'p2wpkh',
  'p2tr'
] as const

const ADDRESS_CHAINS: readonly TrezorConnectorTypes.AddressChain[] = ['receive', 'change'] as const

/** BIP purpose per script type: BIP44 legacy, BIP49 nested, BIP84 native, BIP86 taproot. */
const SCRIPT_TYPE_PURPOSES: Record<TrezorConnectorTypes.BitcoinScriptType, number> = {
  p2pkh: 44,
  p2sh: 49,
  p2wpkh: 84,
  p2tr: 86
}

const PURPOSE_SCRIPT_TYPES: Record<number, TrezorConnectorTypes.BitcoinScriptType> = {
  44: 'p2pkh',
  49: 'p2sh',
  84: 'p2wpkh',
  86: 'p2tr'
}

/** How many indices of each chain are derived per account. Matches the BIP44 gap limit. */
const ADDRESSES_PER_CHAIN = 20

/**
 * The output script type the device expects for one of our own addresses. Using
 * PAYTOWITNESS for everything would misdescribe legacy, nested SegWit and
 * taproot change back to the user.
 */
const OUTPUT_SCRIPT_TYPES: Record<
  TrezorConnectorTypes.BitcoinScriptType,
  TrezorConnectorTypes.OutputScriptType
> = {
  p2pkh: 'PAYTOADDRESS',
  p2sh: 'PAYTOP2SHWITNESS',
  p2wpkh: 'PAYTOWITNESS',
  p2tr: 'PAYTOTAPROOT'
}

const INPUT_SCRIPT_TYPES: Record<
  TrezorConnectorTypes.BitcoinScriptType,
  TrezorConnectorTypes.InputScriptType
> = {
  p2pkh: 'SPENDADDRESS',
  p2sh: 'SPENDP2SHWITNESS',
  p2wpkh: 'SPENDWITNESS',
  p2tr: 'SPENDTAPROOT'
}

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

  /** Account-level extended keys, one per script type, for the cached coin. */
  private accountDescriptors?: TrezorConnectorTypes.AccountDescriptors

  /** The coin `accountDescriptors` were fetched for, so a network switch can invalidate them. */
  private descriptorsCoin?: string

  /**
   * Shared in-flight fetch. Without it, concurrent callers — the adapter calls
   * connect() and getAccountAddresses() back to back on session restore — would
   * each open their own device popup.
   */
  private descriptorsPromise?: Promise<TrezorConnectorTypes.AccountDescriptors>

  /** Every address derived from the account descriptors. */
  private derivedAddresses: TrezorConnectorTypes.DerivedAddress[] = []

  /** Address lookup for path, public key and script type resolution. */
  private addressMap = new Map<string, TrezorConnectorTypes.DerivedAddress>()

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

  /** Coin type for the active network: 0' on mainnet, 1' on testnet. */
  private get coinType(): number {
    return this.currentNetwork === 'Testnet' ? 1 : 0
  }

  /** Payment path for the active network, never the mainnet constant. */
  private get activePaymentPath(): string {
    return `m/84'/${this.coinType}'/0'/0/0`
  }

  /** The account path whose extended key every address of `scriptType` derives from. */
  private accountPath(scriptType: TrezorConnectorTypes.BitcoinScriptType): string {
    return `m/${SCRIPT_TYPE_PURPOSES[scriptType]}'/${this.coinType}'/0'`
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

    const paymentAddress = addresses.find(a => a.purpose === PAYMENT_PURPOSE)

    if (!paymentAddress) {
      throw new Error('No payment address found')
    }

    this.emit('accountsChanged', [paymentAddress.address])

    return paymentAddress.address
  }

  public async disconnect(): Promise<void> {
    this.connectedAddresses = []
    this.clearDerivedState()
    this.emit('disconnect')

    return Promise.resolve()
  }

  public async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    await this.ensureDerivedAddresses()

    /*
     * The adapter collapses whatever comes back to exactly two accounts by
     * position (BitcoinConstantsUtil.ACCOUNT_INDEXES), so this contract stays
     * [payment, ordinal] on the BIP84 receive chain. The rest of the derived
     * matrix is reachable through getDerivedAddresses().
     */
    const payment = this.requireDerived('p2wpkh', 'receive', 0)
    const ordinal = this.requireDerived('p2wpkh', 'receive', 1)

    const addresses: BitcoinConnector.AccountAddress[] = [
      {
        address: payment.address,
        publicKey: payment.publicKey,
        path: payment.path,
        purpose: AddressPurpose.Payment
      },
      {
        address: ordinal.address,
        publicKey: ordinal.publicKey,
        path: ordinal.path,
        purpose: AddressPurpose.Ordinal
      }
    ]

    this.connectedAddresses = addresses

    return addresses
  }

  /**
   * Every address derived for this account: each script type, both the receive
   * and change chains, `ADDRESSES_PER_CHAIN` indices deep. Served from the
   * xpubs fetched at connect time, so it costs no device interaction.
   */
  public async getDerivedAddresses(): Promise<TrezorConnectorTypes.DerivedAddress[]> {
    await this.ensureDerivedAddresses()

    return [...this.derivedAddresses]
  }

  /**
   * The account-level extended public key for each script type. Taproot is an
   * output descriptor rather than a bare xpub — see AccountDescriptors.
   */
  public async getAccountDescriptors(): Promise<TrezorConnectorTypes.AccountDescriptors> {
    return { ...(await this.ensureDerivedAddresses()) }
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

      const inputPath = this.resolveInputPath(input, signInput)

      inputs.push({
        address_n: this.pathToArray(inputPath),
        prev_hash: prevHash,
        prev_index: txInput.index,
        amount: this.getInputAmount(input, txInput.index, i),
        script_type: this.getInputScriptType(input, inputPath),
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
        const address = this.decodeOutputAddress(output.script)
        const derived = this.addressMap.get(address)

        if (derived) {
          /*
           * One of our own addresses — change, or a send to ourselves. Declaring
           * it by derivation path is what lets the device recognise it as change
           * rather than showing the user a third-party recipient. The script
           * type has to match the address: the change chain of a legacy, nested
           * SegWit or taproot account is not native SegWit.
           */
          outputs.push({
            address_n: this.pathToArray(derived.path),
            amount: output.value.toString(),
            script_type: OUTPUT_SCRIPT_TYPES[derived.scriptType]
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
    const previousCoin = this.getCoinName()

    this.currentNetwork = network

    // The new coin needs its own backend before it can be signed for.
    await this.configureBackend()

    /*
     * A different coin type derives from different account keys, so the cache
     * cannot be reused and the device has to be consulted again. Switching to
     * the network already in use costs no device interaction.
     */
    if (this.getCoinName() !== previousCoin) {
      this.clearDerivedState()
      await this.getAccountAddresses()
    }

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
   * Fetches the account extended keys once and derives every address from them.
   * Subsequent calls are served from cache, so the device is consulted a single
   * time per account rather than once per address request.
   */
  private async ensureDerivedAddresses(): Promise<TrezorConnectorTypes.AccountDescriptors> {
    const coin = this.getCoinName()

    if (this.accountDescriptors && this.descriptorsCoin === coin) {
      return this.accountDescriptors
    }

    if (this.descriptorsPromise) {
      return this.descriptorsPromise
    }

    this.descriptorsPromise = this.requestAccountDescriptors(coin).finally(() => {
      this.descriptorsPromise = undefined
    })

    return this.descriptorsPromise
  }

  /**
   * One bundled getPublicKey call covering all four accounts. This is the only
   * point at which the connector asks the device for key material.
   */
  private async requestAccountDescriptors(
    coin: string
  ): Promise<TrezorConnectorTypes.AccountDescriptors> {
    await this.initTrezor()

    const bundle = SCRIPT_TYPES.map(scriptType => ({
      path: this.accountPath(scriptType),
      coin,
      showOnTrezor: false
    }))

    const result = await getTrezorConnect().getPublicKey({ bundle })

    if (!result.success) {
      throw new Error(
        describeTrezorFailure('Failed to get account descriptors from Trezor', result.payload)
      )
    }

    const network = this.getDerivationNetwork()
    const descriptors = {} as TrezorConnectorTypes.AccountDescriptors

    SCRIPT_TYPES.forEach((scriptType, index) => {
      const node = result.payload[index]

      if (!node) {
        throw new Error(`Trezor returned no extended public key for the ${scriptType} account`)
      }

      /*
       * The xpubSegwit field carries the script-type-specific form — ypub/zpub
       * for nested and native SegWit, and the tr(...) output descriptor for
       * taproot — while xpub is always the coin's default format. This is the
       * same precedence TrezorConnect applies when it builds a descriptor.
       */
      const descriptor = node.xpubSegwit ?? node.xpub

      if (!descriptor) {
        throw new Error(`Trezor returned an empty extended public key for ${scriptType}`)
      }

      /*
       * A bare BIP86 xpub carries the same version bytes as a BIP44 one, so a
       * derivation library reading version bytes alone would silently produce
       * legacy addresses for a taproot account. Assert the descriptor resolves
       * to the type we asked for rather than trusting it.
       */
      const { paymentType } = getXpubOrDescriptorInfo(descriptor, network)

      if (paymentType !== scriptType) {
        throw new Error(
          `Trezor returned a ${paymentType} extended key for the ${scriptType} account ` +
            `(${this.accountPath(scriptType)}); deriving from it would produce addresses of the ` +
            'wrong type.'
        )
      }

      descriptors[scriptType] = descriptor
    })

    this.accountDescriptors = descriptors
    this.descriptorsCoin = coin
    this.deriveAddressMatrix(descriptors)

    return descriptors
  }

  /**
   * Expands the account descriptors into concrete addresses. Purely local: no
   * device interaction and no network access.
   */
  private deriveAddressMatrix(descriptors: TrezorConnectorTypes.AccountDescriptors): void {
    const network = this.getDerivationNetwork()
    const derived: TrezorConnectorTypes.DerivedAddress[] = []

    for (const scriptType of SCRIPT_TYPES) {
      const descriptor = descriptors[scriptType]
      const { node } = getXpubOrDescriptorInfo(descriptor, network)

      for (const chain of ADDRESS_CHAINS) {
        const addresses = deriveAddresses(descriptor, chain, 0, ADDRESSES_PER_CHAIN, network)

        /*
         * Only the address and path come back from deriveAddresses, but
         * resolveInputPath matches on public key, so the matching keys are
         * derived alongside them.
         */
        const chainNode = node.derive(chain === 'receive' ? 0 : 1)

        addresses.forEach(({ address, path }, index) => {
          derived.push({
            address,
            path,
            publicKey: Buffer.from(chainNode.derive(index).publicKey).toString('hex'),
            scriptType,
            chain,
            index
          })
        })
      }
    }

    this.derivedAddresses = derived
    this.addressMap = new Map(derived.map(entry => [entry.address, entry]))
  }

  /** The derivation network, from @trezor/utxo-lib rather than bitcoinjs-lib. */
  private getDerivationNetwork() {
    return this.currentNetwork === 'Testnet' ? trezorNetworks.testnet : trezorNetworks.bitcoin
  }

  private requireDerived(
    scriptType: TrezorConnectorTypes.BitcoinScriptType,
    chain: TrezorConnectorTypes.AddressChain,
    index: number
  ): TrezorConnectorTypes.DerivedAddress {
    const derived = this.derivedAddresses.find(
      entry => entry.scriptType === scriptType && entry.chain === chain && entry.index === index
    )

    if (!derived) {
      throw new Error(`No derived ${scriptType} ${chain} address at index ${index}`)
    }

    return derived
  }

  private clearDerivedState(): void {
    this.accountDescriptors = undefined
    this.descriptorsCoin = undefined
    this.derivedAddresses = []
    this.addressMap = new Map()
  }

  /**
   * The script type a path belongs to, read from its BIP purpose. Returns
   * undefined for paths that are not one of the four accounts we derive.
   */
  private static scriptTypeFromPath(
    path: string
  ): TrezorConnectorTypes.BitcoinScriptType | undefined {
    const purpose = path.split('/')[1]

    if (!purpose) {
      return undefined
    }

    return PURPOSE_SCRIPT_TYPES[parseInt(purpose.replace(/['h]$/u, ''), 10)]
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

  /**
   * The derivation path of one of our own addresses. Throws rather than falling
   * back to the payment path: signing an address we cannot place with the key at
   * `.../0/0` would produce a signature from the wrong key silently.
   */
  private getPathForAddress(address: string): string {
    const derived = this.addressMap.get(address)

    if (!derived) {
      throw new Error(
        `Address ${address} was not derived from this Trezor account, so its derivation path is ` +
          'unknown.'
      )
    }

    return derived.path
  }

  /**
   * The derivation path to sign an input with. Explicit `signInputs` win and are
   * resolved against the derived addresses, then the PSBT's own
   * `bip32Derivation`, and only then the account's payment path for the *active*
   * network — never the mainnet constant.
   */
  private resolveInputPath(
    input: btc.Psbt['data']['inputs'][number] | undefined,
    signInput: BitcoinConnector.SignPSBTParams['signInputs'][number] | undefined
  ): string {
    if (signInput?.address) {
      return this.getPathForAddress(signInput.address)
    }

    if (signInput?.publicKey) {
      const derived = this.derivedAddresses.find(entry => entry.publicKey === signInput.publicKey)

      if (!derived) {
        throw new Error(
          `Public key ${signInput.publicKey} was not derived from this Trezor account, so its ` +
            'derivation path is unknown.'
        )
      }

      return derived.path
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
   *
   * Uses @trezor/utxo-lib rather than bitcoinjs-lib because the latter throws
   * "No ECC Library provided" for taproot scripts unless initEccLib() has been
   * called, which would make any PSBT carrying a P2TR output unsignable.
   */
  private decodeOutputAddress(script: Uint8Array): string {
    try {
      return trezorAddress.fromOutputScript(Buffer.from(script), this.getDerivationNetwork())
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
    input: btc.Psbt['data']['inputs'][number] | undefined,
    path?: string
  ): TrezorConnectorTypes.InputScriptType {
    /*
     * Multisig is checked first because a derivation path cannot express it —
     * the account purpose only describes the single-key case.
     */
    if (input?.witnessScript) {
      return 'SPENDMULTISIG'
    }

    /*
     * The path states the account's script type outright, which the script
     * inspection below can only guess at: a nested SegWit input is
     * indistinguishable from a native one when the PSBT omits its redeemScript.
     */
    const pathScriptType = path ? TrezorConnector.scriptTypeFromPath(path) : undefined

    if (pathScriptType) {
      return INPUT_SCRIPT_TYPES[pathScriptType]
    }

    if (input?.witnessUtxo) {
      if (input.redeemScript) {
        return 'SPENDP2SHWITNESS'
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
