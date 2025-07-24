import { describe, expect, it, vi } from 'vitest'

import { type ChainNamespace, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'

import { type AuthConnector, StorageUtil } from '../../exports/index.js'
import { ConnectorController } from '../../src/controllers/ConnectorController.js'
import { ModalController } from '../../src/controllers/ModalController.js'
import { ConnectorControllerUtil } from '../../src/utils/ConnectorControllerUtil.js'

describe('checkNamespaceConnectorId', () => {
  it('should return true if the namespace is associated with the specified connector id', () => {
    const namespace: ChainNamespace = 'eip155'
    const connectorId = 'eip155-connector'
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(connectorId)

    const result = ConnectorControllerUtil.checkNamespaceConnectorId(namespace, connectorId)
    expect(result).toBe(true)
  })

  it('should return false if the namespace is not associated with the specified connector id', () => {
    const namespace: ChainNamespace = 'eip155'
    const connectorId = 'eip155-connector'
    vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue('different-connector')

    const result = ConnectorControllerUtil.checkNamespaceConnectorId(namespace, connectorId)
    expect(result).toBe(false)
  })
})

describe('updateEmail', () => {
  it('should open "UpdateEmailWallet" view', async () => {
    const email = 'test@test.com'

    const openSpy = vi.spyOn(ModalController, 'open')
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({
      id: CommonConstantsUtil.CONNECTOR_ID.AUTH,
      provider: {
        getEmail: () => email
      }
    } as unknown as AuthConnector)
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue(
      CommonConstantsUtil.CONNECTOR_ID.AUTH
    )

    ConnectorControllerUtil.updateEmail()

    await vi.waitFor(() =>
      expect(openSpy).toHaveBeenCalledWith({
        view: 'UpdateEmailWallet',
        data: {
          email: email,
          redirectView: undefined
        }
      })
    )
  })
})
