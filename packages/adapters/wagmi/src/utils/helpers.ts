import { type CaipNetworkId } from '@reown/appkit-common'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'
import { UniversalProvider } from '@walletconnect/universal-provider'
import { fallback, http, type Hex } from 'viem'

import type { Chain } from '@wagmi/core/chains'
import type { Connector } from '@wagmi/core'
import { CoreHelperUtil } from '@reown/appkit-core'
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

export function getTransport({ chain, projectId }: { chain: Chain; projectId: string }) {
  const RPC_URL = CoreHelperUtil.getBlockchainApiUrl()
  const chainDefaultUrl = chain.rpcUrls.default.http?.[0]

  if (!PresetsUtil.WalletConnectRpcChainIds.includes(chain.id)) {
    return http(chainDefaultUrl)
  }

  return fallback([
    http(`${RPC_URL}/v1/?chainId=${ConstantsUtil.EIP155}:${chain.id}&projectId=${projectId}`, {
      /*
       * The Blockchain API uses "Content-Type: text/plain" to avoid OPTIONS preflight requests
       * It will only work for viem >= 2.17.7
       */
      fetchOptions: {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    }),
    http(chainDefaultUrl)
  ])
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
