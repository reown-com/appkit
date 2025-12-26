import type { Balance, CaipNetworkId, ChainNamespace } from '@reown/appkit-common'
import { NumberUtil, ParseUtil } from '@reown/appkit-common'
import { ChainController, CoreHelperUtil } from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'

import type { PaymentAsset, PaymentAssetWithAmount } from '../types/options.js'

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

  if (HelpersUtil.isLowerCaseMatch(balance.symbol, targetNetwork.nativeCurrency.symbol)) {
    asset = 'native'
  } else if (CoreHelperUtil.isCaipAddress(asset)) {
    const { address } = ParseUtil.parseCaipAddress(asset)

    asset = address
  } else if (!asset) {
    throw new Error(`Balance address not found for balance symbol "${balance.symbol}"`)
  }

  return {
    network: targetNetwork.caipNetworkId,
    asset,
    metadata: {
      name: balance.name,
      symbol: balance.symbol,
      decimals: Number(balance.quantity.decimals),
      logoURI: balance.iconUrl
    },
    amount: balance.quantity.numeric
  }
}

export function formatPaymentAssetToBalance(paymentAsset: PaymentAsset): Balance {
  return {
    chainId: paymentAsset.network,
    address: `${paymentAsset.network}:${paymentAsset.asset}`,
    symbol: paymentAsset.metadata.symbol,
    name: paymentAsset.metadata.name,
    iconUrl: paymentAsset.metadata.logoURI || '',
    price: 0,
    quantity: {
      numeric: '0',
      decimals: paymentAsset.metadata.decimals.toString()
    }
  }
}

export function formatAmount(amount: string | number): string {
  const num = NumberUtil.bigNumber(amount, { safe: true })

  if (num.lt(0.001)) {
    return '<0.001'
  }

  return num.round(4).toString()
}

export function isTestnetAsset(paymentAsset: PaymentAsset) {
  const allNetworks = ChainController.getAllRequestedCaipNetworks()
  const targetNetwork = allNetworks.find(net => net.caipNetworkId === paymentAsset.network)

  if (!targetNetwork) {
    return false
  }

  return Boolean(targetNetwork.testnet)
}
