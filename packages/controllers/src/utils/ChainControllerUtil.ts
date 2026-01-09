import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { ChainNamespace } from '@reown/appkit-common'

import { ChainController } from '../controllers/ChainController.js'
import { ConnectorControllerUtil } from './ConnectorControllerUtil.js'
import { ConstantsUtil } from './ConstantsUtil.js'
import type { ChainAdapter } from './TypeUtil.js'

/**
 * Returns the array of chains to disconnect from the connector with the given namespace.
 * If no namespace is provided, it returns all chains.
 * @param namespace - The namespace of the connector to disconnect from.
 * @returns An array of chains to disconnect.
 */
export function getChainsToDisconnect(namespace?: ChainNamespace) {
  const namespaces = Array.from(ChainController.state.chains.keys())
  let chains: [ChainNamespace, ChainAdapter][] = []

  if (namespace) {
    chains.push([namespace, ChainController.state.chains.get(namespace) as ChainAdapter])

    if (
      ConnectorControllerUtil.checkNamespaceConnectorId(
        namespace,
        CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
      )
    ) {
      namespaces.forEach(ns => {
        if (
          ns !== namespace &&
          ConnectorControllerUtil.checkNamespaceConnectorId(
            ns,
            CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT
          )
        ) {
          chains.push([ns, ChainController.state.chains.get(ns) as ChainAdapter])
        }
      })
    } else if (
      ConnectorControllerUtil.checkNamespaceConnectorId(
        namespace,
        CommonConstantsUtil.CONNECTOR_ID.AUTH
      )
    ) {
      namespaces.forEach(ns => {
        if (
          ns !== namespace &&
          ConnectorControllerUtil.checkNamespaceConnectorId(
            ns,
            CommonConstantsUtil.CONNECTOR_ID.AUTH
          )
        ) {
          chains.push([ns, ChainController.state.chains.get(ns) as ChainAdapter])
        }
      })
    }
  } else {
    chains = Array.from(ChainController.state.chains.entries())
  }

  return chains
}

/**
 * Get the active network token address
 * @returns The active network token address
 */
export function getActiveNetworkTokenAddress() {
  const namespace = ChainController.state.activeCaipNetwork?.chainNamespace || 'eip155'
  const chainId = ChainController.state.activeCaipNetwork?.id || 1
  const address = ConstantsUtil.NATIVE_TOKEN_ADDRESS[namespace]

  return `${namespace}:${chainId}:${address}`
}

/**
 * Get the native token address for a given namespace
 * @param namespace - The namespace of the native token
 * @returns The native token address
 */
export function getNativeTokenAddress(namespace: ChainNamespace) {
  return ConstantsUtil.NATIVE_TOKEN_ADDRESS[namespace]
}

/**
 * Get the preferred account type for a given namespace
 * @param namespace - The namespace of the account
 * @returns The preferred account type
 */
export function getPreferredAccountType(namespace: ChainNamespace | undefined) {
  const preferredAccountType = ChainController.getAccountData(namespace)?.preferredAccountType

  return preferredAccountType
}

/**
 * Get the active CAIP network for a given chain namespace, if no namespace is provided, it returns the active CAIP network
 * @param chainNamespace - The chain namespace to get the active CAIP network for
 * @returns The active CAIP network
 */
export function getActiveCaipNetwork(chainNamespace?: ChainNamespace) {
  if (chainNamespace) {
    return ChainController.state.chains.get(chainNamespace)?.networkState?.caipNetwork
  }

  return ChainController.state.activeCaipNetwork
}
