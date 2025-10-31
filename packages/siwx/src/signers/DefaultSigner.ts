import { ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  ConnectorController,
  RouterController
} from '@reown/appkit-controllers'

import type { SIWXSigner } from '../core/SIWXSigner.js'

export default class DefaultSigner implements SIWXSigner {
  public async signMessage(message: string): Promise<string> {
    const network = ChainController.getActiveCaipNetwork()

    if (!network) {
      throw new Error('No ActiveCaipNetwork or client found')
    }

    const connectorId = ConnectorController.getConnectorId(network.chainNamespace)

    if (connectorId === ConstantsUtil.CONNECTOR_ID.AUTH) {
      RouterController.pushTransactionStack({})
    }

    const signature = await ConnectionController.signMessage(message)

    return signature
  }
}
