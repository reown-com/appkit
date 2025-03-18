import { PayController } from './controllers/PayController.js'
import type { PaymentOptions } from './types/options.js'

export async function openPay(options: PaymentOptions) {
  return PayController.handleOpenPay(options)
}

export function getExchanges() {
  return PayController.getExchanges()
}
