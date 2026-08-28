import { type CaipNetworkId, ConstantsUtil } from '@reown/appkit-common'
import {
  AdapterController,
  ChainController,
  ConnectorController,
  ProviderController,
  RouterController
} from '@reown/appkit-controllers'

import type { SIWXSigner } from '../core/SIWXSigner.js'

export default class DefaultSigner implements SIWXSigner {
  public async signMessage(message: string, chainId?: string): Promise<string> {
    const network = chainId
      ? ChainController.getCaipNetworkById(chainId as CaipNetworkId)
      : ChainController.getActiveCaipNetwork()

    if (!network) {
      throw new Error('DefaultSigner: No network found')
    }

    const namespace = network.chainNamespace
    const adapter = AdapterController.get(namespace)

    if (!adapter) {
      throw new Error(`DefaultSigner: No adapter found for namespace ${namespace}`)
    }

    const accountData = ChainController.getAccountData(namespace)
    const address = accountData?.address

    if (!address) {
      throw new Error(`DefaultSigner: No address found for namespace ${namespace}`)
    }

    const connectorId = ConnectorController.getConnectorId(namespace)

    if (connectorId === ConstantsUtil.CONNECTOR_ID.AUTH) {
      RouterController.pushTransactionStack({})
    }

    const result = await adapter.signMessage({
      message,
      address,
      provider: ProviderController.getProvider(namespace),
      caipNetworkId: network.caipNetworkId,
      connectorId
    })

    return result.signature
  }
}
