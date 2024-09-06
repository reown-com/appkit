import type { Tokens } from '@rerock/core'
import { ConstantsUtil } from './ConstantsUtil.js'
import type { CaipNetworkId } from '@rerock/common'

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
  }
}
