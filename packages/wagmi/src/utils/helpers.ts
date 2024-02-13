import { CoreHelperUtil } from '@web3modal/scaffold'
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { http } from 'viem'

import type { CaipNetwork, CaipNetworkId } from '@web3modal/scaffold'
import type { Chain } from '@wagmi/core/chains'
import type { Connector } from '@wagmi/core'

export function getCaipDefaultChain(chain?: Chain) {
  if (!chain) {
    return undefined
  }

  return {
    id: `${ConstantsUtil.EIP155}:${chain.id}`,
    name: chain.name,
    imageId: PresetsUtil.EIP155NetworkImageIds[chain.id]
  } as CaipNetwork
}

export async function getWalletConnectCaipNetworks(connector?: Connector) {
  if (!connector) {
    throw new Error('networkControllerClient:getApprovedCaipNetworks - connector is undefined')
  }
  const provider = (await connector?.getProvider()) as Awaited<
    ReturnType<(typeof EthereumProvider)['init']>
  >
  const ns = provider?.signer?.session?.namespaces
  const nsMethods = ns?.[ConstantsUtil.EIP155]?.methods
  const nsChains = ns?.[ConstantsUtil.EIP155]?.chains as CaipNetworkId[]

  return {
    supportsAllNetworks: Boolean(nsMethods?.includes(ConstantsUtil.ADD_CHAIN_METHOD)),
    approvedCaipNetworkIds: nsChains
  }
}

export function getEmailCaipNetworks() {
  return {
    supportsAllNetworks: false,
    approvedCaipNetworkIds: PresetsUtil.WalletConnectRpcChainIds.map(
      id => `${ConstantsUtil.EIP155}:${id}`
    ) as CaipNetworkId[]
  }
}

export function getTransport({ chainId, projectId }: { chainId: number; projectId: string }) {
  const RPC_URL = CoreHelperUtil.getBlockchainApiUrl()

  if (!PresetsUtil.WalletConnectRpcChainIds.includes(chainId)) {
    return http()
  }

  return http(`${RPC_URL}/v1/?chainId=${ConstantsUtil.EIP155}:${chainId}&projectId=${projectId}`)
}
