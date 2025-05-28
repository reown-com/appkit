import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'

import { AccountController } from '../controllers/AccountController.js'
import { ChainController } from '../controllers/ChainController.js'
import { ConnectorController } from '../controllers/ConnectorController.js'
import { RouterController } from '../controllers/RouterController.js'

export const NetworkUtil = {
  /**
   * Function to handle the network switch.
   * This function has variety of conditions to handle the network switch depending on the connectors or namespace's connection states.
   * @param args.network - The network to switch to.
   * @param args.shouldConfirmSwitch - Whether to confirm the switch. If true, the user will be asked to confirm the switch if necessary.
   * @returns void
   */
  onSwitchNetwork({
    network,
    ignoreSwitchConfirmation = false
  }: {
    network: CaipNetwork
    ignoreSwitchConfirmation?: boolean
  }) {
    const currentNetwork = ChainController.state.activeCaipNetwork
    const routerData = RouterController.state.data
    const isSameNetwork = network.id === currentNetwork?.id

    if (isSameNetwork) {
      return
    }

    const isDifferentNamespace = network.chainNamespace !== ChainController.state.activeChain
    const isNextNamespaceConnected = AccountController.getCaipAddress(network.chainNamespace)
    const connectorId = ConnectorController.getConnectorId(ChainController.state.activeChain)

    /**
     * If the network is supported by the auth connector, we don't need to show switch active chain view.
     * But there are some cases like switching from Ethereum to Bitcoin where Bitcoin is not supported by the auth connector and users should connect with another connector.
     */
    const isConnectedWithAuth = connectorId === ConstantsUtil.CONNECTOR_ID.AUTH
    const isSupportedForAuthConnector = ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(
      c => c === network.chainNamespace
    )

    if (ignoreSwitchConfirmation) {
      RouterController.push('SwitchNetwork', { ...routerData, network })
    } else if (
      // 1. If user connected with auth connector and the next network is not supported by the auth connector, we need to show switch active chain view.
      (isConnectedWithAuth && !isSupportedForAuthConnector) ||
      // 2. If user connected with non-auth connector, we should check if user switching to a different namespace and next namespace is not connected.
      (isDifferentNamespace && !isNextNamespaceConnected)
    ) {
      RouterController.push('SwitchActiveChain', {
        switchToChain: network.chainNamespace,
        navigateTo: 'Connect',
        navigateWithReplace: true,
        network
      })
    } else {
      RouterController.push('SwitchNetwork', { ...routerData, network })
    }
  }
}
