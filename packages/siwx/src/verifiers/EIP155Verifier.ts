import type { SIWXSession } from '@reown/appkit-core'
import { SIWXVerifier } from '../core/SIWXVerifier.js'
import { verifyMessage } from 'viem'

export class EIP155Verifier extends SIWXVerifier {
  public readonly chainNamespace = 'eip155'

  public async verify(session: SIWXSession): Promise<boolean> {
    try {
      return await verifyMessage({
        message: session.message.toString(),
        signature: session.signature as `0x${string}`,
        address: session.message.accountAddress as `0x${string}`
      })
    } catch (error) {
      return false
    }
  }
}
