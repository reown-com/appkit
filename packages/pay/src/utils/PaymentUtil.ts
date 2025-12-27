import {
  type Address,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil,
  ContractUtil,
  ParseUtil
} from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  type PaymentAsset,
  ProviderController
} from '@reown/appkit-controllers'

import {
  DIRECT_TRANSFER_DEPOSIT_TYPE,
  DIRECT_TRANSFER_REQUEST_ID,
  DIRECT_TRANSFER_TRANSACTION_TYPE,
  PayController
} from '../controllers/PayController.js'
import { AppKitPayError } from '../types/errors.js'
import { AppKitPayErrorCodes } from '../types/errors.js'
import type { PaymentOptions } from '../types/options.js'
import type { Quote } from '../types/quote.js'

interface EvmPaymentParams {
  recipient: Address
  amount: number | string
  fromAddress?: Address
}

interface EnsureNetworkOptions {
  paymentAssetNetwork: string
  activeCaipNetwork: CaipNetwork
  approvedCaipNetworkIds: string[] | undefined
  requestedCaipNetworks: CaipNetwork[] | undefined
}

interface GetDirectTransferQuoteParams {
  sourceToken: PaymentAsset
  toToken: PaymentAsset
  recipient: string
  amount: string
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

export function ensureCorrectAddress() {
  const { chainNamespace } = ParseUtil.parseCaipNetworkId(PayController.state.paymentAsset.network)

  const isAddress = CoreHelperUtil.isAddress(PayController.state.recipient, chainNamespace)

  if (!isAddress) {
    throw new AppKitPayError(
      AppKitPayErrorCodes.INVALID_RECIPIENT_ADDRESS_FOR_ASSET,
      `Provide valid recipient address for namespace "${chainNamespace}"`
    )
  }
}

export async function processEvmNativePayment(
  paymentAsset: PaymentOptions['paymentAsset'],
  chainNamespace: ChainNamespace,
  params: EvmPaymentParams
): Promise<string | undefined> {
  if (chainNamespace !== ConstantsUtil.CHAIN.EVM) {
    throw new AppKitPayError(AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE)
  }
  if (!params.fromAddress) {
    throw new AppKitPayError(
      AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG,
      'fromAddress is required for native EVM payments.'
    )
  }

  const amountValue = typeof params.amount === 'string' ? parseFloat(params.amount) : params.amount
  if (isNaN(amountValue)) {
    throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG)
  }

  const decimals = paymentAsset.metadata?.decimals ?? 18
  const amountBigInt = ConnectionController.parseUnits(amountValue.toString(), decimals)

  if (typeof amountBigInt !== 'bigint') {
    throw new AppKitPayError(AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR)
  }

  const txResponse = await ConnectionController.sendTransaction({
    chainNamespace,
    to: params.recipient,
    address: params.fromAddress,
    value: amountBigInt,
    data: '0x'
  })

  return txResponse ?? undefined
}

export async function processEvmErc20Payment(
  paymentAsset: PaymentOptions['paymentAsset'],
  params: EvmPaymentParams
): Promise<string | undefined> {
  if (!params.fromAddress) {
    throw new AppKitPayError(
      AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG,
      'fromAddress is required for ERC20 EVM payments.'
    )
  }
  const tokenAddress = paymentAsset.asset as Address
  const recipientAddress = params.recipient
  const decimals = Number(paymentAsset.metadata.decimals)
  const amountBigInt = ConnectionController.parseUnits(params.amount.toString(), decimals)

  if (amountBigInt === undefined) {
    throw new AppKitPayError(AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR)
  }

  const txResponse = await ConnectionController.writeContract({
    fromAddress: params.fromAddress,
    tokenAddress,
    args: [recipientAddress, amountBigInt],
    method: 'transfer',
    abi: ContractUtil.getERC20Abi(tokenAddress),
    chainNamespace: ConstantsUtil.CHAIN.EVM
  })

  return txResponse ?? undefined
}

interface SolanaPaymentParams {
  recipient: string
  amount: number | string
  fromAddress?: string
  tokenMint?: string
}

export async function processSolanaPayment(
  chainNamespace: ChainNamespace,
  params: SolanaPaymentParams
): Promise<string | undefined> {
  if (chainNamespace !== ConstantsUtil.CHAIN.SOLANA) {
    throw new AppKitPayError(AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE)
  }

  if (!params.fromAddress) {
    throw new AppKitPayError(
      AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG,
      'fromAddress is required for Solana payments.'
    )
  }

  const amountValue = typeof params.amount === 'string' ? parseFloat(params.amount) : params.amount
  if (isNaN(amountValue) || amountValue <= 0) {
    throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG, 'Invalid payment amount.')
  }

  try {
    const provider = ProviderController.getProvider(chainNamespace)
    if (!provider) {
      throw new AppKitPayError(
        AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,
        'No Solana provider available.'
      )
    }
    const txResponse = await ConnectionController.sendTransaction({
      chainNamespace: ConstantsUtil.CHAIN.SOLANA,
      to: params.recipient,
      value: amountValue,
      tokenMint: params.tokenMint
    })

    if (!txResponse) {
      throw new AppKitPayError(AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR, 'Transaction failed.')
    }

    return txResponse
  } catch (error) {
    if (error instanceof AppKitPayError) {
      throw error
    }
    throw new AppKitPayError(
      AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,
      `Solana payment failed: ${error}`
    )
  }
}

export async function getDirectTransferQuote({
  sourceToken,
  toToken,
  amount,
  recipient
}: GetDirectTransferQuoteParams): Promise<Quote> {
  const originalAmount = ConnectionController.parseUnits(amount, sourceToken.metadata.decimals)
  const destinationAmount = ConnectionController.parseUnits(amount, toToken.metadata.decimals)

  return Promise.resolve({
    type: DIRECT_TRANSFER_REQUEST_ID,
    origin: {
      amount: originalAmount?.toString() ?? '0',
      currency: sourceToken
    },
    destination: {
      amount: destinationAmount?.toString() ?? '0',
      currency: toToken
    },
    fees: [
      {
        id: 'service',
        label: 'Service Fee',
        amount: '0',
        currency: toToken
      }
    ],
    steps: [
      {
        requestId: DIRECT_TRANSFER_REQUEST_ID,
        type: 'deposit',
        deposit: {
          amount: originalAmount?.toString() ?? '0',
          currency: sourceToken.asset,
          receiver: recipient
        }
      }
    ],
    timeInSeconds: 6
  })
}

export function getTransferStep(quote?: Quote) {
  if (!quote) {
    return null
  }

  const step = quote.steps[0]

  if (!step || step.type !== DIRECT_TRANSFER_DEPOSIT_TYPE) {
    return null
  }

  return step
}

export function getTransactionsSteps(quote?: Quote, completedTransactionsCount = 0) {
  if (!quote) {
    return []
  }

  const steps = quote.steps.filter(step => step.type === DIRECT_TRANSFER_TRANSACTION_TYPE)

  const stepsToShow = steps.filter((_, idx) => {
    const incrementedIdx = idx + 1

    return incrementedIdx > completedTransactionsCount
  })

  return steps.length > 0 && steps.length < 3 ? stepsToShow : []
}
