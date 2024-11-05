import { type CaipNetworkId } from '@reown/appkit-common'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'
import { UniversalProvider } from '@walletconnect/universal-provider'
import { type Hex } from 'viem'

import type { Connector } from '@wagmi/core'
import { WcHelpersUtil } from '@reown/appkit'

export async function getWalletConnectCaipNetworks(connector?: Connector) {
  if (!connector) {
    throw new Error('networkControllerClient:getApprovedCaipNetworks - connector is undefined')
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
