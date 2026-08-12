/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/require-await */
import { getWallets } from '@wallet-standard/app'
import type { Wallet, WalletWithFeatures } from '@wallet-standard/base'
import { Psbt } from 'bitcoinjs-lib'

import type { CaipNetwork } from '@reown/appkit-common'
import { PresetsUtil } from '@reown/appkit-common'
import type { Provider, RequestArguments } from '@reown/appkit-controllers'
import type { BitcoinConnector } from '@reown/appkit-utils/bitcoin'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { MethodNotSupportedError } from '../errors/MethodNotSupportedError.js'
import { AddressPurpose } from '../utils/BitcoinConnector.js'
import { ProviderEventEmitter } from '../utils/ProviderEventEmitter.js'
import type { BitcoinSigHashFlag } from '../utils/wallet-standard/SignTransaction.js'
import type { BitcoinFeatures } from '../utils/wallet-standard/WalletFeatures.js'

// -- Constants ----
const VALID_PUBLIC_KEY_LENGTHS = [33, 65, 32]
const SIGHASH_ALL = 0x01
const SIGHASH_NONE = 0x02
const SIGHASH_SINGLE = 0x03
const SIGHASH_ANYONECANPAY = 0x80

// -- Helpers ----
function isValidPublicKey(publicKey: ArrayLike<number>): boolean {
  return VALID_PUBLIC_KEY_LENGTHS.includes(publicKey.length)
}

function numericSighashToFlag(sighashType: number): BitcoinSigHashFlag | undefined {
  const baseType = sighashType & 0x1f
  const hasAnyoneCanPay = (sighashType & SIGHASH_ANYONECANPAY) !== 0

  switch (baseType) {
    case SIGHASH_ALL:
      return hasAnyoneCanPay ? 'ALL|ANYONECANPAY' : 'ALL'
    case SIGHASH_NONE:
      return hasAnyoneCanPay ? 'NONE|ANYONECANPAY' : 'NONE'
    case SIGHASH_SINGLE:
      return hasAnyoneCanPay ? 'SINGLE|ANYONECANPAY' : 'SINGLE'
    default:
      return undefined
  }
}

type WalletAccount = Wallet['accounts'][number]

interface BitcoinAccount extends WalletAccount {
  purpose?: AddressPurpose
}

export class WalletStandardConnector extends ProviderEventEmitter implements BitcoinConnector {
  public readonly chain = 'bip122'
  public readonly type = 'ANNOUNCED'

  readonly provider: Provider
  readonly wallet: Wallet
  private requestedChains: CaipNetwork[] = []

  constructor({ wallet, requestedChains }: WalletStandardConnector.ConstructorParams) {
    super()
    this.provider = this
    this.wallet = wallet
    this.requestedChains = requestedChains
    this.provider = this
  }

  public get id(): string {
    return this.name
  }

  public get name(): string {
    return this.wallet.name
  }

  public get imageUrl(): string {
    return this.wallet.icon
  }

  public get explorerId(): string | undefined {
    return PresetsUtil.ConnectorExplorerIds[this.name]
  }

  public get chains() {
    return this.wallet.chains
      .map(chainId =>
        this.requestedChains.find(chain => {
          switch (chainId) {
            case 'bitcoin:mainnet':
              return chain.caipNetworkId === bitcoin.caipNetworkId
            case 'bitcoin:testnet':
              return chain.caipNetworkId === bitcoinTestnet.caipNetworkId
            default:
              return chain.caipNetworkId === chainId
          }
        })
      )
      .filter(Boolean) as CaipNetwork[]
  }

  async connect() {
    const connectFeature = this.getWalletFeature('bitcoin:connect')
    const response = await connectFeature.connect({ purposes: ['payment', 'ordinals'] })
    const account = response.accounts[0]

    if (!account) {
      throw new Error('No account found')
    }

    return account.address
  }

  async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    const accounts = this.wallet.accounts || []

    const addresses = new Set<string>()
    const mappedAccounts = accounts
      .map<BitcoinConnector.AccountAddress>(acc => {
        const { address, purpose, publicKey } = acc as BitcoinAccount

        let validatedPublicKey: string | undefined
        if (publicKey && isValidPublicKey(publicKey)) {
          validatedPublicKey = Buffer.from(publicKey).toString('hex')
        }

        return {
          address,
          purpose: purpose ?? AddressPurpose.Payment,
          publicKey: validatedPublicKey
        }
      })
      .filter(acc => {
        if (addresses.has(acc.address)) {
          return false
        }
        addresses.add(acc.address)

        return true
      })

    return Promise.resolve(mappedAccounts)
  }

  async signMessage(params: BitcoinConnector.SignMessageParams): Promise<string> {
    if (params.protocol) {
      console.warn(
        'WalletStandardConnector:signMessage - protocol parameter not supported in WalletStandard:bitcoin - signMessage'
      )
    }

    const feature = this.getWalletFeature('bitcoin:signMessage')

    const account = this.wallet.accounts.find(acc => acc.address === params.address)

    if (!account) {
      throw new Error('Account not found')
    }

    const message = new TextEncoder().encode(params.message)
    const response = (await feature.signMessage({ account, message }))[0]

    if (!response) {
      throw new Error('No response from wallet')
    }

    return Buffer.from(response.signature).toString('base64')
  }

  async signPSBT(
    params: BitcoinConnector.SignPSBTParams
  ): Promise<BitcoinConnector.SignPSBTResponse> {
    const feature = this.getWalletFeature('bitcoin:signTransaction')

    if (params.broadcast) {
      throw new MethodNotSupportedError(
        this.id,
        'signPSBT',
        'This wallet does not support broadcasting, please broadcast it manually or contact the development team.'
      )
    }

    const requestedInputIndexes = new Set<number>()

    const inputsToSign = params.signInputs.map(input => {
      const account = this.wallet.accounts.find(acc => acc.address === input.address)

      if (!account) {
        throw new Error(`Account with address ${input.address} not found`)
      }

      requestedInputIndexes.add(input.index)

      const sigHash =
        input.sighashTypes?.length > 0
          ? numericSighashToFlag(input.sighashTypes[0] as number)
          : undefined

      return {
        account,
        signingIndexes: [input.index],
        sigHash
      }
    })

    const psbtBytes = new Uint8Array(Buffer.from(params.psbt, 'base64'))

    const response = (
      await feature.signTransaction({
        psbt: psbtBytes,
        inputsToSign
      })
    )[0]

    if (!response) {
      throw new Error('No response from wallet')
    }

    const signedPsbtBase64 = Buffer.from(response.signedPsbt).toString('base64')
    this.verifySignatures(signedPsbtBase64, requestedInputIndexes)

    return {
      psbt: signedPsbtBase64,
      txid: undefined
    }
  }

  private verifySignatures(psbtBase64: string, requestedInputIndexes: Set<number>): void {
    try {
      const psbt = Psbt.fromBase64(psbtBase64)

      for (const index of requestedInputIndexes) {
        const input = psbt.data.inputs[index]

        if (!input) {
          throw new Error(`Input at index ${index} not found in signed PSBT`)
        }

        const hasPartialSig = input.partialSig && input.partialSig.length > 0
        const hasFinalScriptSig = input.finalScriptSig && input.finalScriptSig.length > 0
        const hasFinalScriptWitness =
          input.finalScriptWitness && input.finalScriptWitness.length > 0
        const hasTapKeySig = input.tapKeySig && input.tapKeySig.length > 0
        const hasTapScriptSig = input.tapScriptSig && input.tapScriptSig.length > 0

        const isSigned =
          hasPartialSig ||
          hasFinalScriptSig ||
          hasFinalScriptWitness ||
          hasTapKeySig ||
          hasTapScriptSig

        if (!isSigned) {
          throw new Error(
            `Input at index ${index} was not signed. The wallet may have failed to sign this input.`
          )
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`PSBT signature verification failed: ${error.message}`)
      }
      throw new Error('PSBT signature verification failed: Unknown error')
    }
  }

  async sendTransfer(_params: BitcoinConnector.SendTransferParams): Promise<string> {
    return Promise.reject(
      new MethodNotSupportedError(
        this.id,
        'sendTransfer',
        'Please use "signPSBT" instead and broadcast the transaction manually.'
      )
    )
  }

  async disconnect() {
    return Promise.resolve()
  }

  async request<T>(_args: RequestArguments): Promise<T> {
    return Promise.reject(new MethodNotSupportedError(this.id, 'request'))
  }

  private getWalletFeature<Name extends keyof BitcoinFeatures>(feature: Name) {
    if (!(feature in this.wallet.features)) {
      throw new MethodNotSupportedError(this.id, feature)
    }

    return this.wallet.features[feature] as WalletWithFeatures<
      Record<Name, BitcoinFeatures[Name]>
    >['features'][Name]
  }

  public static watchWallets({
    callback,
    requestedChains
  }: WalletStandardConnector.WatchWalletsParams) {
    const { get, on } = getWallets()

    function wrapWallets(wallets: readonly Wallet[]) {
      // Must replace the filter with the correct function to identify bitcoin wallets
      return wallets
        .filter(wallet => 'bitcoin:connect' in wallet.features)
        .map(wallet => new WalletStandardConnector({ wallet, requestedChains }))
    }

    callback(...wrapWallets(get()))

    return on('register', (...wallets) => callback(...wrapWallets(wallets)))
  }

  public async switchNetwork(caipNetworkId: string): Promise<void> {
    const switchFeature = this.wallet.features['bitcoin:switchNetwork'] as
      | { switchNetwork: (caipNetworkId: string) => Promise<void> }
      | undefined

    if (switchFeature && typeof switchFeature.switchNetwork === 'function') {
      await switchFeature.switchNetwork(caipNetworkId)

      this.emit('change', { accounts: this.wallet.accounts })

      return
    }

    throw new Error(`${this.name} wallet does not support network switching`)
  }
}

export namespace WalletStandardConnector {
  export type ConstructorParams = {
    wallet: Wallet
    requestedChains: CaipNetwork[]
  }

  export type WatchWalletsParams = {
    callback: (...connectors: WalletStandardConnector[]) => void
    requestedChains: CaipNetwork[]
  }
}
