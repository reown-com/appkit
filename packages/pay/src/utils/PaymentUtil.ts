import {
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil,
  ContractUtil
} from '@reown/appkit-common'
import { ChainController, ConnectionController, CoreHelperUtil } from '@reown/appkit-controllers'

import { AppKitPayError } from '../types/errors.js'
import { AppKitPayErrorCodes } from '../types/errors.js'
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
    throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
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
    throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
  }

  try {
    await ChainController.switchActiveNetwork(assetCaipNetwork)
  } catch (error) {
    throw new AppKitPayError(AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR, error)
  }
}

export async function processEvmNativePayment(
  paymentAsset: PaymentOptions['paymentAsset'],
  chainNamespace: ChainNamespace,
  fromAddress: `0x${string}`
): Promise<string | undefined> {
  if (chainNamespace !== ConstantsUtil.CHAIN.EVM) {
    throw new AppKitPayError(AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE)
  }

  const amountValue =
    typeof paymentAsset.amount === 'string' ? parseFloat(paymentAsset.amount) : paymentAsset.amount
  if (isNaN(amountValue)) {
    throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
  }

  const decimals = paymentAsset.metadata?.decimals ?? 18
  const amountBigInt = ConnectionController.parseUnits(amountValue.toString(), decimals)

  if (typeof amountBigInt !== 'bigint') {
    throw new AppKitPayError(AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR)
  }

  if (chainNamespace !== ConstantsUtil.CHAIN.EVM) {
    throw new AppKitPayError(AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE)
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
): Promise<string | undefined> {
  const tokenAddress = paymentAsset.asset as `0x${string}`
  const recipientAddress = paymentAsset.recipient as `0x${string}`
  const decimals = Number(paymentAsset.metadata.decimals)
  const amount = ConnectionController.parseUnits(paymentAsset.amount.toString(), decimals)

  if (amount === undefined) {
    throw new AppKitPayError(AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR)
  }

  const txResponse = await ConnectionController.writeContract({
    fromAddress,
    tokenAddress,
    args: [recipientAddress, amount],
    method: 'transfer',
    abi: ContractUtil.getERC20Abi(tokenAddress),
    chainNamespace: ConstantsUtil.CHAIN.EVM
  })

  return txResponse ?? undefined
}
