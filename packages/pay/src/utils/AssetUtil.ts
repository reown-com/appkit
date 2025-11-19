import type { Balance, CaipNetworkId, ChainNamespace } from '@reown/appkit-common'
import { NumberUtil, ParseUtil } from '@reown/appkit-common'
import { ChainController, CoreHelperUtil } from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'

import type { PaymentAssetWithAmount } from '../types/options.js'

const SUPPORT_PAY_WITH_WALLET_CHAIN_NAMESPACES = ['eip155', 'solana']

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

export function formatBalanceToPaymentAsset(balance: Balance): PaymentAssetWithAmount {
  const allNetworks = ChainController.getAllRequestedCaipNetworks()
  const targetNetwork = allNetworks.find(net => net.caipNetworkId === balance.chainId)

  let asset = balance.address

  if (!targetNetwork) {
    throw new Error(`Target network not found for balance chainId "${balance.chainId}"`)
  }

  if (!asset) {
    if (!HelpersUtil.isLowerCaseMatch(balance.symbol, targetNetwork.nativeCurrency.symbol)) {
      throw new Error(`Balance address not found for balance symbol "${balance.symbol}"`)
    }

    asset = 'native'
  }

  if (CoreHelperUtil.isCaipAddress(asset)) {
    const { address } = ParseUtil.parseCaipAddress(asset)
    asset = address
  }

  return {
    network: targetNetwork.caipNetworkId,
    asset,
    metadata: {
      name: balance.name,
      symbol: balance.symbol,
      decimals: parseInt(balance.quantity.decimals, 10),
      logoURI: balance.iconUrl
    },
    amount: NumberUtil.formatNumberToLocalString(balance.quantity.numeric, 5)
  }
}
