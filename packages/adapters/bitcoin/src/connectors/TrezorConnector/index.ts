import TrezorConnect from '@trezor/connect-web'
import * as btc from 'bitcoinjs-lib'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'
import { CoreHelperUtil, type RequestArguments } from '@reown/appkit-controllers'
import type { BitcoinConnector } from '@reown/appkit-utils/bitcoin'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { MethodNotSupportedError } from '../../errors/MethodNotSupportedError.js'
import { AddressPurpose } from '../../utils/BitcoinConnector.js'
import { ProviderEventEmitter } from '../../utils/ProviderEventEmitter.js'
import type { TrezorConnector as TrezorConnectorTypes } from './types.js'

export class TrezorConnector extends ProviderEventEmitter implements BitcoinConnector {
  public readonly id = 'trezor'
  public readonly name = 'Trezor'
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'
  public readonly imageUrl = 'https://pbs.twimg.com/profile_images/1876994745022529536/5FD_cxXO_400x400.jpg'

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

  constructor({ requestedChains }: TrezorConnectorTypes.ConstructorParams) {
    super()
    this.requestedChains = requestedChains
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
    const paymentAddress = addresses.find(a => a.purpose === AddressPurpose.Payment)

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

    const isTestnet = this.currentNetwork === 'Testnet'
    const paymentPath = isTestnet ? this.testnetPaymentPath : this.paymentPath
    const ordinalPath = isTestnet ? this.testnetOrdinalPath : this.ordinalPath

    const bundle = [
      { path: paymentPath, showOnTrezor: false, coin: this.getCoinName() },
      { path: ordinalPath, showOnTrezor: false, coin: this.getCoinName() }
    ]

    const result = await TrezorConnect.getAddress({ bundle })

    if (!result.success) {
      throw new Error(result.payload.error || 'Failed to get addresses from Trezor')
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

    const result = await TrezorConnect.signMessage({
      path,
      message: params.message,
      coin: this.getCoinName()
    })

    if (!result.success) {
      throw new Error(result.payload.error || 'Failed to sign message with Trezor')
    }

    return result.payload.signature
  }

  public async sendTransfer(params: BitcoinConnector.SendTransferParams): Promise<string> {
    await this.initTrezor()

    const paymentAddress = this.connectedAddresses.find(a => a.purpose === AddressPurpose.Payment)

    if (!paymentAddress) {
      throw new Error('No payment address available')
    }

    const result = await TrezorConnect.composeTransaction({
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
      throw new Error(result.payload.error || 'Failed to send transfer with Trezor')
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
    const outputs: (TrezorConnectorTypes.TrezorOutput | TrezorConnectorTypes.TrezorChangeOutput)[] =
      []

    // Process inputs
    for (let i = 0; i < psbt.data.inputs.length; i++) {
      const input = psbt.data.inputs[i]
      const txInput = psbt.txInputs[i]

      if (!txInput) {
        throw new Error(`Missing transaction input at index ${i}`)
      }

      const signInput = params.signInputs.find(si => si.index === i)
      let path: string

      if (signInput?.address) {
        const addressInfo = this.connectedAddresses.find(a => a.address === signInput.address)
        path = addressInfo?.path || this.getPathForAddress(signInput.address)
      } else if (signInput?.publicKey) {
        const addressInfo = this.connectedAddresses.find(a => a.publicKey === signInput.publicKey)
        path = addressInfo?.path || this.paymentPath
      } else {
        path = this.paymentPath
      }

      const prevHash = Buffer.from(txInput.hash).reverse().toString('hex')
      const amount = input?.witnessUtxo?.value?.toString() || '0'

      inputs.push({
        address_n: this.pathToArray(path),
        prev_hash: prevHash,
        prev_index: txInput.index,
        amount,
        script_type: 'SPENDWITNESS',
        sequence: txInput.sequence
      })
    }

    // Process outputs
    for (const output of psbt.txOutputs) {
      try {
        const address = btc.address.fromOutputScript(output.script, network)
        const isChange = this.connectedAddresses.some(a => a.address === address)

        if (isChange) {
          const addressInfo = this.connectedAddresses.find(a => a.address === address)
          outputs.push({
            address_n: this.pathToArray(addressInfo?.path || this.paymentPath),
            amount: output.value.toString(),
            script_type: 'PAYTOWITNESS'
          })
        } else {
          outputs.push({
            address,
            amount: output.value.toString(),
            script_type: 'PAYTOWITNESS'
          })
        }
      } catch {
        // If we can't decode the address, treat it as OP_RETURN or other script
        outputs.push({
          address: '',
          amount: output.value.toString(),
          script_type: 'PAYTOWITNESS'
        })
      }
    }

    const result = await TrezorConnect.signTransaction({
      inputs: inputs as Parameters<typeof TrezorConnect.signTransaction>[0]['inputs'],
      outputs: outputs as Parameters<typeof TrezorConnect.signTransaction>[0]['outputs'],
      coin: this.getCoinName(),
      version: psbt.version,
      locktime: psbt.locktime
    })

    if (!result.success) {
      throw new Error(result.payload.error || 'Failed to sign transaction with Trezor')
    }

    // Update PSBT with signatures
    const signedTx = btc.Transaction.fromHex(result.payload.serializedTx)

    // Finalize the PSBT with the signed transaction
    for (let i = 0; i < psbt.data.inputs.length; i++) {
      const input = signedTx.ins[i]
      if (input?.witness && input.witness.length > 0) {
        psbt.updateInput(i, {
          finalScriptWitness: this.witnessStackToScriptWitness(input.witness)
        })
      }
    }

    let txid: string | undefined
    if (params.broadcast) {
      const pushResult = await TrezorConnect.pushTransaction({
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

    await TrezorConnect.init({
      manifest: {
        email: 'support@reown.com',
        appUrl: typeof window !== 'undefined' ? window.location.origin : 'https://reown.com',
        appName: 'Reown AppKit'
      },
      lazyLoad: true,
      popup: true
    })

    this.initialized = true
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
        return 'Bitcoin'
    }
  }

  private getPathForAddress(address: string): string {
    const isTestnet = this.currentNetwork === 'Testnet'

    // Default to payment path if we can't determine
    if (address.startsWith('bc1') || address.startsWith('tb1')) {
      return isTestnet ? this.testnetPaymentPath : this.paymentPath
    }

    return isTestnet ? this.testnetPaymentPath : this.paymentPath
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
