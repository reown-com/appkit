import type { Tokens } from '@web3modal/core'
import { ConstantsUtil } from './ConstantsUtil.js'

export const HelpersUtil = {
  getCaipTokens(tokens?: Tokens) {
    if (!tokens) {
      return undefined
    }

    const caipTokens: Tokens = {}
    Object.entries(tokens).forEach(([id, token]) => {
      caipTokens[`${ConstantsUtil.EIP155}:${id}`] = token
    })

    return caipTokens
  }
}
