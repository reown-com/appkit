import type { SessionNamespace, UniversalProvider } from '@walletconnect/universal-provider'

import {
  type CaipAddress,
  type CaipNetwork,
  type CaipNetworkId,
  ParseUtil
} from '@reown/appkit-common'

import { ConstantsUtil, StorageUtil } from '../../../exports/utils.js'
import { ConnectionController } from '../ConnectionController.js'
import { ConnectorController } from '../ConnectorController.js'
import { EventsController } from '../EventsController.js'
import { ModalController } from '../ModalController.js'
import { OptionsController } from '../OptionsController.js'
import { PublicStateController } from '../PublicStateController.js'
import { SendController } from '../SendController.js'
import type { Ports } from './ChainMachine.js'

function getChainsFromNamespaces(namespaces: SessionNamespace): CaipNetworkId[] {
  return Object.values(namespaces).flatMap((namespace: SessionNamespace) => {
    const chains = (namespace.chains || []) as CaipNetworkId[]
    const accountsChains =
      namespace.accounts?.map(account => {
        const { chainId, chainNamespace } = ParseUtil.parseCaipAddress(account as CaipAddress)

        return `${chainNamespace}:${chainId}`
      }) || []

    return Array.from(new Set([...chains, ...accountsChains]))
  }) as CaipNetworkId[]
}

const ports: Ports = {
  persistActiveCaipNetworkId: id => StorageUtil.setActiveCaipNetworkId(id),
  setPublicState: patch => PublicStateController.set(patch),
  filterConnectorsByNamespace: (ns, enabled) => ConnectorController.filterByNamespace(ns, enabled),
  filterConnectorsByNamespaces: nss => ConnectorController.filterByNamespaces(nss),
  openUnsupportedChainUI: () => ModalController.open({ view: 'UnsupportedChain' }),
  resetSend: () => SendController.resetSend(),
  trackSwitchNetwork: id =>
    EventsController.sendEvent({
      type: 'track',
      event: 'SWITCH_NETWORK',
      properties: { network: id }
    }),
  requestProviderSwitch: async () => {
    // TODX: Implement
  },
  loadActiveNetworkProps: () => StorageUtil.getActiveNetworkProps(),
  getApprovedNetworksData: ({ activeNamespace, activeNetwork, requestedCaipNetworks }) => {
    const connections = ConnectionController.getConnections(activeNamespace)
    const connection = connections.find(conn => conn.caipNetwork?.id === activeNetwork?.id)

    if (connection?.connectorId === 'walletConnect') {
      const connector = ConnectorController.getConnector({ id: connection.connectorId })
      const provider = connector?.provider as Awaited<ReturnType<typeof UniversalProvider.init>>

      const approvedCaipNetworkIds = getChainsFromNamespaces(
        provider?.session?.namespaces as unknown as SessionNamespace
      )

      const approvedCaipNetworks = approvedCaipNetworkIds
        .map(caipNetworkId => requestedCaipNetworks.find(n => n.caipNetworkId === caipNetworkId))
        .filter(Boolean) as CaipNetwork[]

      return {
        /*
         * MetaMask Wallet only returns 1 namespace in the session object. This makes it imposible
         * to switch to other networks. Setting supportsAllNetworks to true for MetaMask Wallet
         * will make it possible to switch to other networks.
         */
        supportsAllNetworks: provider?.session?.peer?.metadata.name === 'MetaMask Wallet',
        approvedCaipNetworks
      }
    }

    return { supportsAllNetworks: true, approvedCaipNetworks: requestedCaipNetworks }
  },
  flags: {
    enableNetworkSwitch: Boolean(OptionsController.state.enableNetworkSwitch),
    allowUnsupportedChain: Boolean(OptionsController.state.allowUnsupportedChain),
    namesSupportedNamespaces: ConstantsUtil.NAMES_SUPPORTED_CHAIN_NAMESPACES
  }
}

export default ports
