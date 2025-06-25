import { type CaipNetworkId, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { ChainController, ConnectorController, type Tokens } from '@reown/appkit-controllers'

import { ConstantsUtil } from './ConstantsUtil.js'

export const HelpersUtil = {
  getCaipTokens(tokens?: Tokens) {
    if (!tokens) {
      return undefined
    }

    const caipTokens: Tokens = {}
    Object.entries(tokens).forEach(([id, token]) => {
      caipTokens[`${ConstantsUtil.EIP155}:${id}` as CaipNetworkId] = token
    })

    return caipTokens
  },

  isLowerCaseMatch(str1?: string, str2?: string) {
    return str1?.toLowerCase() === str2?.toLowerCase()
  },

  /**
   * Iterates the Auth connector supported chains and returns the namespace that is last connected to the active chain.
   * @returns ChainNamespace | undefined
   */
  getActiveNamespaceConnectedToAuth() {
    const activeChain = ChainController.state.activeChain

    return CommonConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(
      chain =>
        ConnectorController.getConnectorId(chain) === CommonConstantsUtil.CONNECTOR_ID.AUTH &&
        chain === activeChain
    )
  },

  /**
   * Runs a condition function again and again until it returns true or the max number of tries is reached.
   *
   * @param conditionFn - A function (can be async) that returns true when the condition is met.
   * @param intervalMs - Time to wait between tries, in milliseconds.
   * @param maxRetries - Maximum number of times to try before stopping.
   * @returns A Promise that resolves to true if the condition becomes true in time, or false if it doesn't.
   */
  withRetry({
    conditionFn,
    intervalMs,
    maxRetries
  }: {
    conditionFn: () => boolean | Promise<boolean>
    intervalMs: number
    maxRetries: number
  }): Promise<boolean> {
    let attempts = 0

    return new Promise(resolve => {
      async function tryCheck() {
        attempts += 1

        const result = await conditionFn()

        if (result) {
          return resolve(true)
        }

        if (attempts >= maxRetries) {
          return resolve(false)
        }

        setTimeout(tryCheck, intervalMs)

        return null
      }

      tryCheck()
    })
  }
}
