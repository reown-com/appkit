import type { CaipNetworkId, ChainNamespace } from '@reown/appkit-common'
import { ParseUtil } from '@reown/appkit-common'

const SUPPORT_PAY_WITH_WALLET_CHAIN_NAMESPACES = ['eip155']

const CHAIN_ASSET_INFO_MAP: Partial<
  Record<
    ChainNamespace,
    {
      native: { assetNamespace: string; assetReference: string }
      defaultTokenNamespace: string
    }
  >
> = {
  eip155: {
    native: { assetNamespace: 'slip44', assetReference: '60' },
    defaultTokenNamespace: 'erc20'
  },
  solana: {
    native: { assetNamespace: 'slip44', assetReference: '501' },
    defaultTokenNamespace: 'token'
  }
}

export function formatCaip19Asset(caipNetworkId: CaipNetworkId, asset: string): string {
  const { chainNamespace, chainId } = ParseUtil.parseCaipNetworkId(caipNetworkId)

  const chainInfo = CHAIN_ASSET_INFO_MAP[chainNamespace]
  if (!chainInfo) {
    throw new Error(`Unsupported chain namespace for CAIP-19 formatting: ${chainNamespace}`)
  }

  let assetNamespace = chainInfo.native.assetNamespace
  let assetReference = chainInfo.native.assetReference

  if (asset !== 'native') {
    assetNamespace = chainInfo.defaultTokenNamespace
    assetReference = asset
  }

  const networkPart = `${chainNamespace}:${chainId}`

  return `${networkPart}/${assetNamespace}:${assetReference}`
}

export function isPayWithWalletSupported(networkId: CaipNetworkId): boolean {
  const { chainNamespace } = ParseUtil.parseCaipNetworkId(networkId)

  return SUPPORT_PAY_WITH_WALLET_CHAIN_NAMESPACES.includes(chainNamespace)
}
