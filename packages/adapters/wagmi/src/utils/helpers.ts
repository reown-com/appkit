import type { Connector, CreateConnectorFn } from '@wagmi/core'
import { UniversalProvider } from '@walletconnect/universal-provider'
import { type Hex } from 'viem'

import { type CaipNetworkId } from '@reown/appkit-common'
import { CoreHelperUtil, WcHelpersUtil } from '@reown/appkit-controllers'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'

export async function getWalletConnectCaipNetworks(connector?: Connector) {
  if (!connector) {
    throw new Error('WagmiAdapter:getApprovedCaipNetworks - connector is undefined')
  }
  const provider = (await connector?.getProvider()) as Awaited<
    ReturnType<(typeof UniversalProvider)['init']>
  >

  const approvedCaipNetworkIds = WcHelpersUtil.getChainsFromNamespaces(
    provider?.session?.namespaces
  )

  return {
    supportsAllNetworks: false,
    approvedCaipNetworkIds
  }
}

export function getEmailCaipNetworks() {
  return {
    supportsAllNetworks: true,
    approvedCaipNetworkIds: PresetsUtil.WalletConnectRpcChainIds.map(
      id => `${ConstantsUtil.EIP155}:${id}`
    ) as CaipNetworkId[]
  }
}

export function requireCaipAddress(caipAddress: string) {
  if (!caipAddress) {
    throw new Error('No CAIP address provided')
  }
  const account = caipAddress.split(':')[2] as Hex
  if (!account) {
    throw new Error('Invalid CAIP address')
  }

  return account
}

export function parseWalletCapabilities(str: string) {
  try {
    return JSON.parse(str)
  } catch (error) {
    throw new Error('Error parsing wallet capabilities')
  }
}

export async function getSafeConnector(
  connectors: readonly Connector[]
): Promise<CreateConnectorFn | null> {
  if (CoreHelperUtil.isSafeApp()) {
    const { safe } = await import('@wagmi/connectors')

    if (safe && !connectors.some(c => c.type === 'safe')) {
      const safeConnector = safe()

      return safeConnector
    }
  }

  return null
}

export async function getBaseAccountConnector(
  connectors: readonly Connector[]
): Promise<CreateConnectorFn | null> {
  try {
    const { baseAccount } = await import('@wagmi/connectors')

    if (baseAccount && !connectors.some(c => c.id === 'baseAccount')) {
      return baseAccount()
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to import Coinbase Wallet SDK:', error)
  }

  return null
}
