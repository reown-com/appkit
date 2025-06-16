import type UniversalProvider from '@walletconnect/universal-provider'

import type { CaipNetwork, ChainNamespace, Connection } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { type CombinedProvider, CoreHelperUtil, type Provider } from '@reown/appkit-controllers'
import { ConnectorUtil } from '@reown/appkit-scaffold-ui/utils'
import type { BitcoinConnector } from '@reown/appkit-utils/bitcoin'
import type { Provider as SolanaProvider } from '@reown/appkit-utils/solana'

import { WcHelpersUtil } from '../utils/HelpersUtil.js'
import type { ChainAdapterConnector } from './ChainAdapterConnector.js'

interface BaseSyncParams<Connector = unknown, P = unknown> {
  connectors: Connector[]
  caipNetwork?: CaipNetwork
  caipNetworks: CaipNetwork[]
  universalProvider: UniversalProvider
  onConnection: (connection: Connection) => void
  onListenProvider: (connectorId: string, provider: P) => void
  getConnectionStatusInfo: (connectorId: string) => {
    hasDisconnected: boolean
    hasConnected: boolean
  }
}

type SyncEvmConnections = BaseSyncParams<ChainAdapterConnector, Provider | CombinedProvider>
type SyncBitcoinConnections = BaseSyncParams<BitcoinConnector, BitcoinConnector>
type SyncSolanaConnections = BaseSyncParams<SolanaProvider, SolanaProvider>

export class ChainAdapterConnection {
  public namespace: ChainNamespace

  constructor(params: { namespace: ChainNamespace }) {
    this.namespace = params.namespace
  }

  public async syncConnections(
    params: SyncEvmConnections | SyncSolanaConnections | SyncBitcoinConnections
  ) {
    switch (this.namespace) {
      case CommonConstantsUtil.CHAIN.EVM:
        await this.syncEVMConnections(params as SyncEvmConnections)
        break

      case CommonConstantsUtil.CHAIN.SOLANA:
        await this.syncSolanaConnections(params as SyncSolanaConnections)
        break

      case CommonConstantsUtil.CHAIN.BITCOIN:
        await this.syncBitcoinConnections(params as SyncBitcoinConnections)
        break

      default:
        throw new Error(`Unsupported chain namespace: ${this.namespace}`)
    }
  }

  private async syncEVMConnections({
    connectors,
    caipNetworks,
    universalProvider,
    getConnectionStatusInfo,
    onConnection,
    onListenProvider
  }: SyncEvmConnections) {
    await Promise.all(
      connectors
        .filter(c => {
          const { hasDisconnected, hasConnected } = getConnectionStatusInfo(c.id)

          return !hasDisconnected && hasConnected
        })
        .map(async connector => {
          if (connector.id === CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT) {
            const accounts = WcHelpersUtil.getWalletConnectAccounts(universalProvider, 'eip155')
            const caipNetwork = caipNetworks.find(
              n =>
                n.chainNamespace === 'eip155' &&
                n.id.toString() === accounts[0]?.chainId?.toString()
            )

            if (accounts.length > 0) {
              onConnection({
                connectorId: connector.id,
                accounts: accounts.map(account => ({ address: account.address })),
                caipNetwork
              })
            }
          } else {
            const { accounts, chainId } = await ConnectorUtil.fetchProviderData(connector)

            if (accounts.length > 0 && chainId) {
              const caipNetwork = caipNetworks.find(
                n => n.chainNamespace === 'eip155' && n.id.toString() === chainId.toString()
              )

              onConnection({
                connectorId: connector.id,
                accounts: accounts.map(address => ({ address })),
                caipNetwork
              })

              if (
                connector.provider &&
                connector.id !== CommonConstantsUtil.CONNECTOR_ID.AUTH &&
                connector.id !== CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
              ) {
                onListenProvider(connector.id, connector.provider as Provider | CombinedProvider)
              }
            }
          }
        })
    )
  }

  private async syncSolanaConnections({
    connectors,
    caipNetwork,
    universalProvider,
    getConnectionStatusInfo,
    onConnection,
    onListenProvider
  }: SyncSolanaConnections) {
    await Promise.all(
      connectors
        .filter(c => {
          const { hasDisconnected, hasConnected } = getConnectionStatusInfo(c.id)

          return !hasDisconnected && hasConnected
        })
        .map(async connector => {
          if (connector.id === CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT) {
            const accounts = WcHelpersUtil.getWalletConnectAccounts(universalProvider, 'solana')

            if (accounts.length > 0) {
              onConnection({
                connectorId: connector.id,
                accounts: accounts.map(account => ({ address: account.address })),
                caipNetwork
              })
            }
          } else {
            const address = await connector.connect({
              chainId: caipNetwork?.id as string
            })

            if (address) {
              onConnection({
                connectorId: connector.id,
                accounts: [{ address }],
                caipNetwork
              })

              onListenProvider(connector.id, connector.provider as SolanaProvider)
            }
          }
        })
    )
  }

  private async syncBitcoinConnections({
    connectors,
    caipNetwork,
    universalProvider,
    getConnectionStatusInfo,
    onConnection,
    onListenProvider
  }: SyncBitcoinConnections) {
    await Promise.all(
      connectors
        .filter(c => {
          const { hasDisconnected, hasConnected } = getConnectionStatusInfo(c.id)

          return !hasDisconnected && hasConnected
        })
        .map(async connector => {
          if (connector.id === CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT) {
            const accounts = WcHelpersUtil.getWalletConnectAccounts(universalProvider, 'bip122')

            if (accounts.length > 0) {
              onConnection({
                connectorId: connector.id,
                accounts: accounts.map(account => ({ address: account.address })),
                caipNetwork
              })
            }

            return
          }

          const address = await connector.connect()
          const addresses = await connector.getAccountAddresses()

          let accounts = addresses?.map(a =>
            CoreHelperUtil.createAccount(
              CommonConstantsUtil.CHAIN.BITCOIN,
              a.address,
              a.purpose || 'payment',
              a.publicKey,
              a.path
            )
          )

          if (accounts && accounts.length > 1) {
            accounts = [
              {
                namespace: CommonConstantsUtil.CHAIN.BITCOIN,
                publicKey: accounts[0]?.publicKey ?? '',
                path: accounts[0]?.path ?? '',
                address: accounts[0]?.address ?? '',
                type: 'payment'
              },
              {
                namespace: CommonConstantsUtil.CHAIN.BITCOIN,
                publicKey: accounts[1]?.publicKey ?? '',
                path: accounts[1]?.path ?? '',
                address: accounts[1]?.address ?? '',
                type: 'ordinal'
              }
            ]
          }

          const chain = connector.chains.find(c => c.id === caipNetwork?.id) || connector.chains[0]

          if (!chain) {
            throw new Error('The connector does not support any of the requested chains')
          }

          if (address) {
            onListenProvider(connector.id, connector.provider as BitcoinConnector)
            onConnection({
              connectorId: connector.id,
              accounts: accounts.map(a => ({ address: a.address, type: a.type })),
              caipNetwork
            })
          }
        })
    )
  }
}
