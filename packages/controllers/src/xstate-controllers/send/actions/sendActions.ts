import { RouterController } from '../../../controllers/RouterController.js'
import { SnackController } from '../../../controllers/SnackController.js'
import type { SendContext } from '../types/sendTypes.js'

export function showSuccessMessage() {
  SnackController.showSuccess('Transaction started')
}

export function showErrorMessage({ context }: { context: SendContext }) {
  const message = context.error || 'Failed to send transaction. Please try again.'
  SnackController.showError(message)
}

export function navigateToAccount() {
  RouterController.replace('Account')
}

export function navigateToTokenSelect() {
  RouterController.push('WalletSendSelectToken')
}

export function navigateToPreview() {
  RouterController.push('WalletSendPreview')
}

export function navigateBack() {
  RouterController.goBack()
}
