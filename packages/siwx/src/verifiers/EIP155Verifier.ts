import { createPublicClient, http } from 'viem'

import { type BaseNetwork, ConstantsUtil } from '@reown/appkit-common'
import { ChainController, type SIWXSession } from '@reown/appkit-controllers'

import { SIWXVerifier } from '../core/SIWXVerifier.js'

/**
 * Default verifier for EIP155 sessions.
 */
export class EIP155Verifier extends SIWXVerifier {
  public readonly chainNamespace = ConstantsUtil.CHAIN.EVM

  public async verify(session: SIWXSession): Promise<boolean> {
    const caipNetwork = ChainController.state.chains
      .get('eip155')
      ?.caipNetworks?.find(cn => cn.caipNetworkId === session.data.chainId)

    if (!caipNetwork) {
      throw new Error('EIP155.verify: CaipNetwork not found')
    }

    try {
      const client = createPublicClient({
        chain: caipNetwork as BaseNetwork,
        transport: http(caipNetwork?.['rpcUrls'].default.http[0])
      })

      return await client.verifyMessage({
        message: session.message.toString(),
        signature: session.signature as `0x${string}`,
        address: session.data.accountAddress as `0x${string}`
      })
    } catch (error) {
      return false
    }
  }
}
