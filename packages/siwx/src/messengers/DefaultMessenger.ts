import { type CaipNetworkId, ConstantsUtil } from '@reown/appkit-common'
import type { SIWXMessage } from '@reown/appkit-controllers'

import { InformalMessenger } from './InformalMessenger.js'

// Phantom rejects Solana sign-in messages without a statement or with a CAIP-2 Chain ID
export class DefaultMessenger extends InformalMessenger {
  override async createMessage(input: SIWXMessage.Input): Promise<SIWXMessage> {
    const message = await super.createMessage(input)

    if (input.chainId.startsWith(`${ConstantsUtil.CHAIN.SOLANA}:`)) {
      message.statement ??= ConstantsUtil.SOLANA_SIGN_IN.STATEMENT
    }

    return message
  }

  protected override getMessageChainId(chainId: CaipNetworkId): string | undefined {
    return (
      ConstantsUtil.SOLANA_SIGN_IN.MESSAGE_CHAIN_IDS[chainId] ?? super.getMessageChainId(chainId)
    )
  }
}
