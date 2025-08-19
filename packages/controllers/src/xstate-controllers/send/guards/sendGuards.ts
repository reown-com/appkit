import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'

import { ChainController } from '../../../controllers/ChainController.js'
import { ConstantsUtil } from '../../../utils/ConstantsUtil.js'
import { CoreHelperUtil } from '../../../utils/CoreHelperUtil.js'
import type { SendContext } from '../types/sendTypes.js'

// Token validation guards
export function hasSelectedToken({ context }: { context: SendContext }): boolean {
  return Boolean(context.selectedToken)
}

export function isValidToken({ context }: { context: SendContext }): boolean {
  return Boolean(context.selectedToken?.symbol)
}

// Amount validation guards
export function hasAmount({ context }: { context: SendContext }): boolean {
  return Boolean(context.sendAmount && context.sendAmount > 0)
}

export function isValidAmount({ context }: { context: SendContext }): boolean {
  const { sendAmount, selectedToken } = context

  if (!sendAmount || !selectedToken) {
    return false
  }

  // Check if amount is positive
  if (sendAmount <= 0) {
    return false
  }

  // Check if amount is not greater than available balance
  const availableBalance = Number(selectedToken.quantity.numeric)
  if (sendAmount > availableBalance) {
    return false
  }

  return true
}

export function hasSufficientBalance({ context }: { context: SendContext }): boolean {
  const { sendAmount, selectedToken } = context

  if (!sendAmount || !selectedToken) {
    return false
  }

  const availableBalance = Number(selectedToken.quantity.numeric)

  return sendAmount <= availableBalance
}

// Address validation guards
export function hasReceiverAddress({ context }: { context: SendContext }): boolean {
  return Boolean(context.receiverAddress && context.receiverAddress.trim().length > 0)
}

export function isValidAddress({ context }: { context: SendContext }): boolean {
  const { receiverAddress } = context

  if (!receiverAddress) {
    return false
  }

  const activeChain = ChainController.state.activeChain

  return CoreHelperUtil.isAddress(receiverAddress, activeChain)
}

export function isENSName({ context }: { context: SendContext }): boolean {
  const { receiverAddress } = context

  if (!receiverAddress) {
    return false
  }

  // Simple check for .eth domains or other ENS-like patterns
  return (
    receiverAddress.includes('.') &&
    !CoreHelperUtil.isAddress(receiverAddress, ChainController.state.activeChain)
  )
}

// Form completion guards
export function isFormComplete({ context }: { context: SendContext }): boolean {
  return hasSelectedToken({ context }) && hasAmount({ context }) && hasReceiverAddress({ context })
}

export function canSendTransaction({ context }: { context: SendContext }): boolean {
  return (
    isFormComplete({ context }) &&
    isValidToken({ context }) &&
    isValidAmount({ context }) &&
    isValidAddress({ context }) &&
    hasSufficientBalance({ context })
  )
}

// Network and chain guards
export function isEvmChain(): boolean {
  const activeChain = ChainController.state.activeCaipNetwork?.chainNamespace

  return activeChain === CommonConstantsUtil.CHAIN.EVM
}

export function isSolanaChain(): boolean {
  const activeChain = ChainController.state.activeCaipNetwork?.chainNamespace

  return activeChain === 'solana'
}

export function isNativeToken({ context }: { context: SendContext }): boolean {
  return !context.selectedToken?.address
}

export function isERC20Token({ context }: { context: SendContext }): boolean {
  return Boolean(context.selectedToken?.address)
}

// Retry logic guards
export function canRetry({ context }: { context: SendContext }): boolean {
  return context.retryCount < 3
}

export function shouldAllowRetry({ context }: { context: SendContext }): boolean {
  const { lastRetry } = context

  if (!lastRetry) {
    return true
  }

  return CoreHelperUtil.isAllowedRetry(lastRetry, 30 * ConstantsUtil.ONE_SEC_MS)
}

// Loading state guards
export function isNotLoading({ context }: { context: SendContext }): boolean {
  return !context.loading
}

// Error state guards
export function hasNoErrors({ context }: { context: SendContext }): boolean {
  return !context.error && Object.keys(context.validationErrors).length === 0
}

export function hasValidationErrors({ context }: { context: SendContext }): boolean {
  return Object.keys(context.validationErrors).length > 0
}

// Value calculation guard
export function hasValidValue({ context }: { context: SendContext }): boolean {
  const { selectedToken, sendAmount } = context

  if (!selectedToken?.price || !sendAmount) {
    return false
  }

  const totalValue = selectedToken.price * sendAmount

  return totalValue > 0
}
