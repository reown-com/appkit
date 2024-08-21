import { CoreHelperUtil } from '@web3modal/scaffold'
import { ConstantsUtil as CommonConstantsUtil, type CaipNetwork } from '@web3modal/common'
import { ConstantsUtil, PresetsUtil } from '@web3modal/scaffold-utils'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { getChainsFromAccounts } from '@walletconnect/utils'
import { fallback, http, type Hex } from 'viem'

import type { CaipNetworkId } from '@web3modal/scaffold'
import type { Chain } from '@wagmi/core/chains'
import type { Connector } from '@wagmi/core'

export function getCaipDefaultNetwork(chain?: CaipNetwork) {
  if (!chain) {
    return undefined
  }

  return {
    id: chain.id,
    name: chain.name,
    imageId: PresetsUtil.NetworkImageIds[chain.chainId],
    chainNamespace: CommonConstantsUtil.CHAIN.EVM
  } as unknown as CaipNetwork
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
  const nsChains = getChainsFromAccounts(
    ns?.[ConstantsUtil.EIP155]?.accounts || []
  ) as CaipNetworkId[]

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

export function getTransport({ chain, projectId }: { chain: Chain; projectId: string }) {
  const RPC_URL = CoreHelperUtil.getBlockchainApiUrl()
  const chainDefaultUrl = chain.rpcUrls[0]?.http?.[0]

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
