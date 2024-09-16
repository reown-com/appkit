import { type CaipNetwork, type CaipNetworkId } from '@reown/appkit-common'
import { ConstantsUtil, PresetsUtil } from '@reown/appkit-utils'
import { UniversalProvider } from '@walletconnect/universal-provider'
import { fallback, http, type Hex } from 'viem'

import type { Chain } from '@wagmi/core/chains'
import type { Connector } from '@wagmi/core'
import { CoreHelperUtil } from '@reown/appkit-core'

export async function getWalletConnectCaipNetworks(connector?: Connector) {
  if (!connector) {
    throw new Error('networkControllerClient:getApprovedCaipNetworks - connector is undefined')
  }
  const provider = (await connector?.getProvider()) as Awaited<
    ReturnType<(typeof UniversalProvider)['init']>
  >

  const namespaces = provider?.session?.namespaces

  if (!namespaces) {
    return Promise.resolve({
      approvedCaipNetworkIds: [],
      supportsAllNetworks: false
    })
  }

  const approvedCaipNetworkIds = Object.values(namespaces).flatMap<CaipNetworkId>(namespace => {
    const chains = (namespace.chains || []) as CaipNetworkId[]
    const accountsChains = namespace.accounts.map(account => {
      const [chainNamespace, chainId] = account.split(':')

      return `${chainNamespace}:${chainId}` as CaipNetworkId
    })

    return Array.from(new Set([...chains, ...accountsChains]))
  })

  return Promise.resolve({
    approvedCaipNetworkIds,
    supportsAllNetworks: false
  })
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

export function convertToAppKitChains(caipNetworks: CaipNetwork[]) {
  const chains = caipNetworks.map(caipNetwork => ({
    blockExplorers: {
      default: {
        apiUrl: '',
        name: '',
        url: caipNetwork.explorerUrl || ''
      }
    },
    fees: undefined,
    formatters: undefined,
    id: Number(caipNetwork.chainId),
    name: caipNetwork.name,
    nativeCurrency: {
      decimals: 18,
      name: caipNetwork.currency,
      symbol: caipNetwork.currency
    },
    rpcUrls: {
      default: {
        http: [caipNetwork.rpcUrl]
      }
    },
    serializers: undefined
  })) as unknown as readonly [Chain, ...Chain[]]

  return chains
}
