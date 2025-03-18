import { describe, expect, it, vi } from 'vitest'

import { type ChainNamespace } from '@reown/appkit-common'

import { ConnectorController } from '../../src/controllers/ConnectorController.js'
import { checkNamespaceConnectorId } from '../../src/utils/ConnectorControllerUtil.js'

describe('checkNamespaceConnectorId', () => {
  it('should return true if the namespace is associated with the specified connector id', () => {
    const namespace: ChainNamespace = 'eip155'
    const connectorId = 'eip155-connector'
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(connectorId)

    const result = checkNamespaceConnectorId(namespace, connectorId)
    expect(result).toBe(true)
  })

  it('should return false if the namespace is not associated with the specified connector id', () => {
    const namespace: ChainNamespace = 'eip155'
    const connectorId = 'eip155-connector'
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('different-connector')

    const result = checkNamespaceConnectorId(namespace, connectorId)
    expect(result).toBe(false)
  })
})
