import { W3mFrameStorage } from './W3mFrameStorage.js'
import { W3mFrameConstants, W3mFrameRpcConstants } from './W3mFrameConstants.js'
import type { W3mFrameTypes } from './W3mFrameTypes.js'
import { RegexUtil } from './RegexUtil.js'

const EMAIL_MINIMUM_TIMEOUT = 30 * 1000

export const W3mFrameHelpers = {
  checkIfAllowedToTriggerEmail() {
    const lastEmailLoginTime = W3mFrameStorage.get(W3mFrameConstants.LAST_EMAIL_LOGIN_TIME)
    if (lastEmailLoginTime) {
      const difference = Date.now() - Number(lastEmailLoginTime)
      if (difference < EMAIL_MINIMUM_TIMEOUT) {
        const cooldownSec = Math.ceil((EMAIL_MINIMUM_TIMEOUT - difference) / 1000)
        throw new Error(`Please try again after ${cooldownSec} seconds`)
      }
    }
  },

  getTimeToNextEmailLogin() {
    const lastEmailLoginTime = W3mFrameStorage.get(W3mFrameConstants.LAST_EMAIL_LOGIN_TIME)
    if (lastEmailLoginTime) {
      const difference = Date.now() - Number(lastEmailLoginTime)
      if (difference < EMAIL_MINIMUM_TIMEOUT) {
        return Math.ceil((EMAIL_MINIMUM_TIMEOUT - difference) / 1000)
      }
    }

    return 0
  },

  checkIfRequestExists(request: W3mFrameTypes.RPCRequest) {
    return (
      W3mFrameRpcConstants.NOT_SAFE_RPC_METHODS.includes(request.method) ||
      W3mFrameRpcConstants.SAFE_RPC_METHODS.includes(request.method)
    )
  },

  getResponseType(response: W3mFrameTypes.RPCResponse) {
    const isPayloadString = typeof response === 'string'
    const isTransactionHash =
      isPayloadString &&
      (response?.match(RegexUtil.transactionHash) || response?.match(RegexUtil.signedMessage))

    if (isTransactionHash) {
      return W3mFrameConstants.RPC_RESPONSE_TYPE_TX
    }

    return W3mFrameConstants.RPC_RESPONSE_TYPE_OBJECT
  },

  checkIfRequestIsSafe(request: W3mFrameTypes.RPCRequest) {
    return W3mFrameRpcConstants.SAFE_RPC_METHODS.includes(request.method)
  },

  isClient: typeof window !== 'undefined'
}
