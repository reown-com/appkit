import type { CaipNetworkId, ChainNamespace } from '@reown/appkit-common'
import { ParseUtil } from '@reown/appkit-common'

import type { AddressOrNative } from '../types/options.js'

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
  }
}

export function formatCaip19Asset(caipNetworkId: CaipNetworkId, asset: AddressOrNative): string {
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
