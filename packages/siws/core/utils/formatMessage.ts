import { SiwxMessageCommon, type SiwxMessageCreatorArgs } from '@web3modal/core'

export const formatMessage = (args: SiwxMessageCreatorArgs) => {
  const { typeSiwx, ...rest } = args

  const siwxCommon = new SiwxMessageCommon(rest)
  const message = new TextDecoder().decode(siwxCommon.toMessage(typeSiwx))

  return message as string
}
