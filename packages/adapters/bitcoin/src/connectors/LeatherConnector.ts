import type { RpcEndpointMap, RpcSendTransferParams } from '@leather.io/rpc'
import type { MessageSigningProtocols } from 'sats-connect'

import { ConstantsUtil } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'
import type { BitcoinConnector } from '@reown/appkit-utils/bitcoin'
import { bitcoin, bitcoinSignet, bitcoinTestnet } from '@reown/appkit/networks'

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
      requestedChains: connector.requestedChains
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
      recipients: [{ address: recipient, amount }],
      network: this.getNetwork()
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
    broadcast = false,
    signInputs
  }: BitcoinConnector.SignPSBTParams): Promise<BitcoinConnector.SignPSBTResponse> {
    const signInputObj = signInputs?.[0]
    const params: LeatherConnector.SignPSBTParams = {
      hex: Buffer.from(psbt, 'base64').toString('hex'),
      network: this.getNetwork(),
      broadcast,
      signAtIndex: signInputObj?.index,
      allowedSighash: signInputObj?.sighashTypes
    }

    // @ts-expect-error - expected LeatherWallet params don't match sats-connect
    const res: LeatherConnector.SignPSBTResponse = await this.internalRequest('signPsbt', params)

    return {
      psbt: Buffer.from(res.hex, 'hex').toString('base64'),
      txid: res.txid
    }
  }

  public override async signMessage(params: BitcoinConnector.SignMessageParams): Promise<string> {
    const networkName = this.getNetwork()
    const protocol = params.protocol?.toUpperCase() as MessageSigningProtocols

    const res = await this.internalRequest('signMessage', {
      ...params,
      protocol,
      // @ts-expect-error - expected LeatherWallet params don't match sats-connect
      network: networkName.toLowerCase()
    })

    return res.signature
  }

  public override async switchNetwork(_caipNetworkId: string): Promise<void> {
    // Leather wallet doesn't support network switching, we rely on AK's network switching
    return Promise.resolve()
  }

  private getNetwork(): LeatherConnector.Network {
    const activeCaipNetwork = ChainController.getActiveCaipNetwork(ConstantsUtil.CHAIN.BITCOIN)
    switch (activeCaipNetwork?.caipNetworkId) {
      case bitcoin.caipNetworkId:
        return 'mainnet'
      case bitcoinTestnet.caipNetworkId:
        return 'testnet'

      case bitcoinSignet.caipNetworkId:
        return 'signet'
      default:
        throw new Error('LeatherConnector: unsupported network')
    }
  }
}

export namespace LeatherConnector {
  export type ConstructorParams = { connector: SatsConnectConnector }

  export type Network = 'mainnet' | 'testnet' | 'signet' | 'sbtcDevenv' | 'devnet'

  export type SendTransferParams = RpcSendTransferParams

  export type SendTransferResponse = { txid: string }

  export type SignPSBTParams = RpcEndpointMap['signPsbt']['request']['params']

  export type SignPSBTResponse = { hex: string; txid?: string }
}
