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
  }
}
