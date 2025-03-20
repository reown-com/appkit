import type {
  SendTransferRequestParams,
  SendTransferResponseBody,
  SignPsbtRequestParams,
  SignPsbtResponseBody
} from '@leather.io/rpc'

import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import type { BitcoinConnector } from '../index.js'
import { SatsConnectConnector } from './SatsConnectConnector.js'

export class LeatherConnector extends SatsConnectConnector {
  static readonly ProviderId = 'LeatherProvider'

  private connectedAccounts?: BitcoinConnector.AccountAddress[]

  constructor({ connector }: LeatherConnector.ConstructorParams) {
    if (connector.wallet.id !== LeatherConnector.ProviderId) {
      throw new Error('LeatherConnector: wallet must be a LeatherProvider')
    }

    super({
      provider: connector.wallet,
      requestedChains: connector.requestedChains,
      getActiveNetwork: connector.getActiveNetwork
    })
  }

  public override get imageUrl() {
    return this.wallet?.icon?.replace('data:image/svg', 'data:image/svg+xml')
  }

  override async getAccountAddresses(): Promise<BitcoinConnector.AccountAddress[]> {
    // Keep the connected accounts in memory to avoid repeated requests because Leather doesn't have a connect method
    if (this.connectedAccounts) {
      return this.connectedAccounts
    }

    this.connectedAccounts = await super.getAccountAddresses()

    return this.connectedAccounts
  }

  public override disconnect(): Promise<void> {
    // Leather doesn't have disconnect method
    this.connectedAccounts = undefined

    return Promise.resolve()
  }

  public override async sendTransfer({
    amount,
    recipient
  }: BitcoinConnector.SendTransferParams): Promise<string> {
    const params: LeatherConnector.SendTransferParams = {
      address: recipient,
      amount
    }

    const res: LeatherConnector.SendTransferResponse = await this.internalRequest(
      'sendTransfer',
      // @ts-expect-error - expected LeatherWallet params don't match sats-connect
      params
    )

    return res.txid
  }

  public override async signPSBT({
    psbt,
    broadcast = false
  }: BitcoinConnector.SignPSBTParams): Promise<BitcoinConnector.SignPSBTResponse> {
    const params: LeatherConnector.SignPSBTParams = {
      hex: Buffer.from(psbt, 'base64').toString('hex'),
      network: this.getNetwork(),
      broadcast
    }

    // @ts-expect-error - expected LeatherWallet params don't match sats-connect
    const res: LeatherConnector.SignPSBTResponse = await this.internalRequest('signPsbt', params)

    return {
      psbt: Buffer.from(res.hex, 'hex').toString('base64'),
      txid: res.txid
    }
  }

  private getNetwork(): LeatherConnector.Network {
    const activeCaipNetwork = this.getActiveNetwork()

    switch (activeCaipNetwork?.caipNetworkId) {
      case bitcoin.caipNetworkId:
        return 'mainnet'
      case bitcoinTestnet.caipNetworkId:
        return 'testnet'
      default:
        throw new Error('LeatherConnector: unsupported network')
    }
  }
}

export namespace LeatherConnector {
  export type ConstructorParams = { connector: SatsConnectConnector }

  export type Network = 'mainnet' | 'testnet' | 'signet' | 'sbtcDevenv' | 'devnet'

  export type SendTransferParams = SendTransferRequestParams

  export type SendTransferResponse = SendTransferResponseBody

  export type SignPSBTParams = SignPsbtRequestParams

  export type SignPSBTResponse = SignPsbtResponseBody
}
