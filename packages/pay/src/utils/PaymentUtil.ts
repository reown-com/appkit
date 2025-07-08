import { Connection } from '@solana/web3.js'

import {
  type Address,
  type CaipNetwork,
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil,
  ContractUtil
} from '@reown/appkit-common'
import { ChainController, ConnectionController, CoreHelperUtil } from '@reown/appkit-controllers'
import { ProviderUtil } from '@reown/appkit-utils'
import type { Provider as SolanaProvider } from '@reown/appkit-utils/solana'

import { AppKitPayError } from '../types/errors.js'
import { AppKitPayErrorCodes } from '../types/errors.js'
import type { PaymentOptions } from '../types/options.js'
import { createSPLTokenTransaction } from './SolanaUtil.js'

// 1 second
const CONFIRMATION_CHECK_INTERVAL_MS = 1000
// 30 attempts = 30 seconds total
const CONFIRMATION_MAX_ATTEMPTS = 30

// Helper function to create a delay
function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

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

interface EvmPaymentParams {
  recipient: Address
  amount: number | string
  fromAddress?: Address
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
}

export async function processSolanaNativePayment(
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
    const provider = ProviderUtil.getProvider(chainNamespace)
    if (!provider) {
      throw new AppKitPayError(
        AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,
        'No Solana provider available.'
      )
    }

    const txResponse = await ConnectionController.sendTransaction({
      chainNamespace: ConstantsUtil.CHAIN.SOLANA,
      to: params.recipient,
      value: amountValue
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

export async function processSolanaSPLPayment(
  paymentAsset: PaymentOptions['paymentAsset'],
  chainNamespace: ChainNamespace,
  params: SolanaPaymentParams
): Promise<string | undefined> {
  if (chainNamespace !== ConstantsUtil.CHAIN.SOLANA) {
    throw new AppKitPayError(AppKitPayErrorCodes.INVALID_CHAIN_NAMESPACE)
  }

  if (!params.fromAddress) {
    throw new AppKitPayError(
      AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG,
      'fromAddress is required for SPL payments.'
    )
  }

  const tokenMint = paymentAsset.asset
  const amountValue = typeof params.amount === 'string' ? parseFloat(params.amount) : params.amount
  if (isNaN(amountValue) || amountValue <= 0) {
    throw new AppKitPayError(AppKitPayErrorCodes.INVALID_PAYMENT_CONFIG, 'Invalid payment amount.')
  }

  const decimals = paymentAsset.metadata?.decimals ?? 9

  try {
    const provider = ProviderUtil.getProvider(chainNamespace) as SolanaProvider
    if (!provider) {
      throw new AppKitPayError(
        AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,
        'No Solana provider available.'
      )
    }

    const activeNetwork = ChainController.getActiveCaipNetwork()
    const rpcUrl = activeNetwork?.rpcUrls?.default?.http?.[0]

    if (!rpcUrl) {
      throw new AppKitPayError(
        AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,
        'No RPC URL available for active network.'
      )
    }

    const connection = new Connection(rpcUrl, 'confirmed')

    const transaction = await createSPLTokenTransaction({
      provider,
      connection,
      to: params.recipient,
      amount: amountValue,
      tokenMint,
      decimals
    })

    const signature = await provider.sendTransaction(transaction, connection)

    await waitForConfirmation(connection, signature)

    return signature
  } catch (error) {
    if (error instanceof AppKitPayError) {
      throw error
    }
    throw new AppKitPayError(
      AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,
      `Solana SPL payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

async function waitForConfirmation(connection: Connection, signature: string): Promise<void> {
  for (let attempts = 0; attempts < CONFIRMATION_MAX_ATTEMPTS; attempts += 1) {
    // eslint-disable-next-line no-await-in-loop
    const status = await connection.getSignatureStatus(signature)

    if (status?.value) {
      if (status.value.err) {
        throw new AppKitPayError(
          AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,
          `Transaction failed: ${JSON.stringify(status.value.err)}`
        )
      }

      return
    }

    if (attempts < CONFIRMATION_MAX_ATTEMPTS - 1) {
      // eslint-disable-next-line no-await-in-loop
      await delay(CONFIRMATION_CHECK_INTERVAL_MS)
    }
  }

  throw new AppKitPayError(
    AppKitPayErrorCodes.GENERIC_PAYMENT_ERROR,
    `Transaction confirmation timeout after ${CONFIRMATION_MAX_ATTEMPTS} attempts`
  )
}
