import { type WalletKitTypes } from '@reown/walletkit'

export const WalletKitUtil = {
  getMessageFromSessionRequest(event: WalletKitTypes.SessionRequest): string {
    const { request } = event.params

    const requestParamsMessage = request.params[0]

    return requestParamsMessage
  }
}
