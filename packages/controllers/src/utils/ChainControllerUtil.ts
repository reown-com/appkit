import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { ChainNamespace } from '@reown/appkit-common'

import { ConnectionController } from '../controllers/ConnectionController.js'
import { ChainController } from '../controllers/poc/ChainController.js'
import { ConnectorControllerUtil } from './ConnectorControllerUtil.js'
import { ConstantsUtil } from './ConstantsUtil.js'
import type { NamespaceState } from './TypeUtil copy.js'

/**
 * Returns the array of chains to disconnect from the connector with the given namespace.
 * If no namespace is provided, it returns all chains.
 * @param namespace - The namespace of the connector to disconnect from.
 * @returns An array of chains to disconnect.
 */
export function getChainsToDisconnect(namespace?: ChainNamespace) {
  const namespaces = Array.from(ChainController.getSnapshot().context.namespaces.keys())
  let chains: [ChainNamespace, NamespaceState][] = []

  if (namespace) {
    chains.push([
      namespace,
      ChainController.getSnapshot().context.namespaces.get(namespace) as NamespaceState
    ])

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
          chains.push([
            ns,
            ChainController.getSnapshot().context.namespaces.get(ns) as NamespaceState
          ])
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
          chains.push([
            ns,
            ChainController.getSnapshot().context.namespaces.get(ns) as NamespaceState
          ])
        }
      })
    }
  } else {
    chains = Array.from(ChainController.getSnapshot().context.namespaces.entries())
  }

  return chains
}

/**
 * Get the active network token address
 * @returns The active network token address
 */
export function getActiveNetworkTokenAddress() {
  const namespace = ChainController.getActiveCaipNetwork()?.chainNamespace || 'eip155'
  const chainId = ChainController.getActiveCaipNetwork()?.id || 1
  const address = ConstantsUtil.NATIVE_TOKEN_ADDRESS[namespace]

  return `${namespace}:${chainId}:${address}`
}

/**
 * Get the preferred account type for a given namespace
 * @param namespace - The namespace of the account
 * @returns The preferred account type
 */
export function getPreferredAccountType(namespace: ChainNamespace | undefined) {
  const preferredAccountType = ConnectionController.getAccountData(namespace)?.preferredAccountType

  return preferredAccountType
}

/**
 * Get the active CAIP network for a given chain namespace, if no namespace is provided, it returns the active CAIP network
 * @param chainNamespace - The chain namespace to get the active CAIP network for
 * @returns The active CAIP network
 */
export function getActiveCaipNetwork(chainNamespace?: ChainNamespace) {
  if (chainNamespace) {
    return ChainController.getSnapshot().context.namespaces.get(chainNamespace)?.activeCaipNetwork
  }

  return ChainController.getActiveCaipNetwork()
}
