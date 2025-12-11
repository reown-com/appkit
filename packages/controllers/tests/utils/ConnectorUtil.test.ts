import { describe, expect, it } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'

import { ConnectorUtil } from '../../src/utils/ConnectorUtil'
import type { ConnectorWithProviders } from '../../src/utils/TypeUtil'

// -- Helpers ------------------------------------------------------------------
function createMockConnector(id: string, name: string): ConnectorWithProviders {
  return {
    id,
    name,
    type: 'EXTERNAL',
    chain: 'eip155'
  }
}

// -- Tests --------------------------------------------------------------------
describe('ConnectorUtil', () => {
  describe('sortConnectorsByPriority', () => {
    it('should put BASE_ACCOUNT connector first', () => {
      const connectors = [
        createMockConnector('metamask', 'MetaMask'),
        createMockConnector(ConstantsUtil.CONNECTOR_ID.BASE_ACCOUNT, 'Base Account'),
        createMockConnector('rainbow', 'Rainbow')
      ]

      const sorted = ConnectorUtil.sortConnectorsByPriority(connectors)

      expect(sorted[0]?.id).toBe(ConstantsUtil.CONNECTOR_ID.BASE_ACCOUNT)
    })

    it('should put COINBASE connector after BASE_ACCOUNT', () => {
      const connectors = [
        createMockConnector('metamask', 'MetaMask'),
        createMockConnector(ConstantsUtil.CONNECTOR_ID.COINBASE, 'Coinbase Wallet'),
        createMockConnector(ConstantsUtil.CONNECTOR_ID.BASE_ACCOUNT, 'Base Account')
      ]

      const sorted = ConnectorUtil.sortConnectorsByPriority(connectors)

      expect(sorted[0]?.id).toBe(ConstantsUtil.CONNECTOR_ID.BASE_ACCOUNT)
      expect(sorted[1]?.id).toBe(ConstantsUtil.CONNECTOR_ID.COINBASE)
    })

    it('should put COINBASE_SDK connector after BASE_ACCOUNT', () => {
      const connectors = [
        createMockConnector('rainbow', 'Rainbow'),
        createMockConnector(ConstantsUtil.CONNECTOR_ID.COINBASE_SDK, 'Coinbase SDK'),
        createMockConnector(ConstantsUtil.CONNECTOR_ID.BASE_ACCOUNT, 'Base Account')
      ]

      const sorted = ConnectorUtil.sortConnectorsByPriority(connectors)

      expect(sorted[0]?.id).toBe(ConstantsUtil.CONNECTOR_ID.BASE_ACCOUNT)
      expect(sorted[1]?.id).toBe(ConstantsUtil.CONNECTOR_ID.COINBASE_SDK)
    })

    it('should maintain relative order for other connectors', () => {
      const connectors: ConnectorWithProviders[] = [
        createMockConnector('metamask', 'MetaMask'),
        createMockConnector('rainbow', 'Rainbow'),
        createMockConnector('trust', 'Trust Wallet')
      ]

      const sorted = ConnectorUtil.sortConnectorsByPriority(connectors)

      expect(sorted[0]?.id).toBe('metamask')
      expect(sorted[1]?.id).toBe('rainbow')
      expect(sorted[2]?.id).toBe('trust')
    })

    it('should handle empty array', () => {
      const sorted = ConnectorUtil.sortConnectorsByPriority([])

      expect(sorted).toEqual([])
    })

    it('should handle array with only BASE_ACCOUNT', () => {
      const connectors = [
        createMockConnector(ConstantsUtil.CONNECTOR_ID.BASE_ACCOUNT, 'Base Account')
      ]

      const sorted = ConnectorUtil.sortConnectorsByPriority(connectors)

      expect(sorted).toHaveLength(1)
      expect(sorted[0]?.id).toBe(ConstantsUtil.CONNECTOR_ID.BASE_ACCOUNT)
    })

    it('should sort correctly with all priority connectors present', () => {
      const connectors = [
        createMockConnector('metamask', 'MetaMask'),
        createMockConnector(ConstantsUtil.CONNECTOR_ID.COINBASE_SDK, 'Coinbase SDK'),
        createMockConnector('rainbow', 'Rainbow'),
        createMockConnector(ConstantsUtil.CONNECTOR_ID.BASE_ACCOUNT, 'Base Account'),
        createMockConnector(ConstantsUtil.CONNECTOR_ID.COINBASE, 'Coinbase Wallet')
      ]

      const sorted = ConnectorUtil.sortConnectorsByPriority(connectors)

      expect(sorted[0]?.id).toBe(ConstantsUtil.CONNECTOR_ID.BASE_ACCOUNT)
      expect(sorted[1]?.id).toBe(ConstantsUtil.CONNECTOR_ID.COINBASE_SDK)
      expect(sorted[2]?.id).toBe(ConstantsUtil.CONNECTOR_ID.COINBASE)
    })
  })
})
