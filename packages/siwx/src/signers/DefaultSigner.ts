import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  ConnectorController,
  RouterController,
  type SignMessageContext
} from '@reown/appkit-controllers'

import type { SIWXSigner } from '../core/SIWXSigner.js'

export default class DefaultSigner implements SIWXSigner {
  public async signMessage(message: string, context?: SignMessageContext): Promise<string> {
    const client = ConnectionController._getClient()

    if (!client) {
      throw new Error('No ConnectionController client found')
    }

    const network = context?.chainId
      ? ChainController.getCaipNetworkById(context.chainId)
      : ChainController.getActiveCaipNetwork()

    if (!network) {
      throw new Error('No ActiveCaipNetwork or client found')
    }

    const connectorId =
      context?.connectorId || ConnectorController.getConnectorId(network.chainNamespace)

    if (connectorId === ConstantsUtil.CONNECTOR_ID.AUTH) {
      RouterController.pushTransactionStack({})
    }

    const signature = await client.signMessage(message, context)

    return signature
  }
}
