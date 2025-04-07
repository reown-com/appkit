import {
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil,
  ContractUtil
} from '@reown/appkit-common'
import { ChainController, ConnectionController, CoreHelperUtil } from '@reown/appkit-controllers'

import type { PaymentOptions } from '../types/options.js'

interface EnsureNetworkOptions {
  paymentAssetNetwork: string
  activeCaipNetwork: CaipNetwork
  approvedCaipNetworkIds: string[] | undefined
  requestedCaipNetworks: CaipNetwork[] | undefined
}

export async function ensureCorrectNetwork(options: EnsureNetworkOptions): Promise<void> {
  const { paymentAssetNetwork, activeCaipNetwork, approvedCaipNetworkIds, requestedCaipNetworks } =
    options

  const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(
    approvedCaipNetworkIds as CaipNetworkId[] | undefined,
    requestedCaipNetworks
  )

  const assetCaipNetwork = sortedNetworks.find(
    network => network.caipNetworkId === paymentAssetNetwork
  )

  if (!assetCaipNetwork) {
    throw new Error(
      `Payment asset network (${paymentAssetNetwork}) not found in available networks.`
    )
  }

  if (assetCaipNetwork.caipNetworkId === activeCaipNetwork.caipNetworkId) {
    return
  }

  const isSupportingAllNetworks = ChainController.getNetworkProp(
    'supportsAllNetworks',
    assetCaipNetwork.chainNamespace
  )

  const isSwitchAllowed =
    approvedCaipNetworkIds?.includes(assetCaipNetwork.caipNetworkId) || isSupportingAllNetworks

  if (!isSwitchAllowed) {
    throw new Error(
      `Switching to network ${assetCaipNetwork.caipNetworkId} is not permitted. It's not in the approved list and the wallet does not support adding it automatically.`
    )
  }

  try {
    await ChainController.switchActiveNetwork(assetCaipNetwork)
  } catch (error) {
    throw new Error(`Failed to switch to network ${assetCaipNetwork.caipNetworkId}: ${error}`)
  }
}

export async function processEvmNativePayment(
  paymentAsset: PaymentOptions['paymentAsset'],
  chainNamespace: ChainNamespace,
  fromAddress: `0x${string}`
): Promise<string | undefined> {
  const amountValue =
    typeof paymentAsset.amount === 'string' ? parseFloat(paymentAsset.amount) : paymentAsset.amount
  if (isNaN(amountValue)) {
    throw new Error('Invalid payment amount for native transfer')
  }

  const decimals = paymentAsset.metadata?.decimals ?? 18
  const amountBigInt = ConnectionController.parseUnits(amountValue.toString(), decimals)

  if (typeof amountBigInt !== 'bigint') {
    throw new Error('Failed to parse amount into BigInt for native transfer')
  }

  if (chainNamespace !== ConstantsUtil.CHAIN.EVM) {
    throw new Error(`Unsupported chain namespace for EVM native payment: ${chainNamespace}`)
  }

  const txResponse = await ConnectionController.sendTransaction({
    chainNamespace,
    to: paymentAsset.recipient as `0x${string}`,
    address: fromAddress,
    value: amountBigInt,
    data: '0x'
  })

  return txResponse ?? undefined
}

export async function processEvmErc20Payment(
  paymentAsset: PaymentOptions['paymentAsset'],
  fromAddress: `0x${string}`
): Promise<void> {
  const tokenAddress = paymentAsset.asset as `0x${string}`
  const recipientAddress = paymentAsset.recipient as `0x${string}`
  const decimals = Number(paymentAsset.metadata.decimals)
  const amount = ConnectionController.parseUnits(paymentAsset.amount.toString(), decimals)

  if (typeof amount !== 'bigint') {
    throw new Error('Failed to parse amount into BigInt for native transfer')
  }

  await ConnectionController.writeContract({
    fromAddress,
    tokenAddress,
    args: [recipientAddress, amount],
    method: 'transfer',
    abi: ContractUtil.getERC20Abi(tokenAddress),
    chainNamespace: ConstantsUtil.CHAIN.EVM
  })
}
