import { type CaipNetworkId, ConstantsUtil } from '@reown/appkit-common'
import type { SIWXMessage } from '@reown/appkit-controllers'
import { SOLANA_MESSAGE_CHAIN_IDS, SOLANA_STATEMENT } from '@reown/appkit-controllers/features'

import { InformalMessenger } from './InformalMessenger.js'

// Phantom rejects Solana sign-in messages without a statement or with a CAIP-2 Chain ID
export class DefaultMessenger extends InformalMessenger {
  override async createMessage(input: SIWXMessage.Input): Promise<SIWXMessage> {
    const message = await super.createMessage(input)

    if (input.chainId.startsWith(`${ConstantsUtil.CHAIN.SOLANA}:`)) {
      message.statement ??= SOLANA_STATEMENT
    }

    return message
  }

  protected override getMessageChainId(chainId: CaipNetworkId): string | undefined {
    return SOLANA_MESSAGE_CHAIN_IDS[chainId] ?? super.getMessageChainId(chainId)
  }
}
