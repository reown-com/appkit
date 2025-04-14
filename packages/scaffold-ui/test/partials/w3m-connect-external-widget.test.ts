import { fixture } from '@open-wc/testing'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  ApiController,
  AssetUtil,
  ConnectorController,
  type ConnectorWithProviders
} from '@reown/appkit-controllers'

import { W3mConnectExternalWidget } from '../../src/partials/w3m-connect-external-widget'

const MOCK_CONNECTORS = [
  {
    id: 'external1',
    name: 'External Wallet 1',
    type: 'EXTERNAL',
    info: { rdns: 'io.external.wallet1' }
  },
  {
    id: 'external2',
    name: 'External Wallet 2',
    type: 'EXTERNAL',
    info: { rdns: 'io.external.wallet2' }
  },
  {
    id: 'external3',
    name: 'External Wallet 3',
    type: 'EXTERNAL',
    info: { rdns: 'io.external.wallet3' }
  },
  {
    id: ConstantsUtil.CONNECTOR_ID.COINBASE_SDK,
    name: 'Coinbase Wallet',
    type: 'EXTERNAL',
    info: { rdns: 'io.coinbase.wallet' }
  }
] as ConnectorWithProviders[]

describe('W3mConnectExternalWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.spyOn(ConnectorController, 'state', 'get').mockReturnValue({
      ...ConnectorController.state,
      connectors: MOCK_CONNECTORS
    })
    vi.spyOn(ConnectorController, 'subscribeKey').mockImplementation(() => {
      return () => undefined
    })
    vi.spyOn(AssetUtil, 'getConnectorImage').mockReturnValue('image-url')
  })

  it('should display all non-excluded wallets when no exclusions are present', async () => {
    vi.spyOn(ApiController.state, 'excludedWallets', 'get').mockReturnValue([])

    const element: W3mConnectExternalWidget = await fixture(
      html`<w3m-connect-external-widget></w3m-connect-external-widget>`
    )

    const walletElements = element.shadowRoot?.querySelectorAll('wui-list-wallet')
    expect(walletElements?.length).toBe(3)

    const walletNames = Array.from(walletElements || []).map(el => el.getAttribute('name'))
    expect(walletNames).toContain('External Wallet 1')
    expect(walletNames).toContain('External Wallet 2')
    expect(walletNames).toContain('External Wallet 3')
    expect(walletNames).not.toContain('Coinbase Wallet')
  })

  it('should filter out wallets excluded by RDNS while showing non-excluded wallets', async () => {
    vi.spyOn(ApiController.state, 'excludedWallets', 'get').mockReturnValue([
      { rdns: 'io.external.wallet1', name: 'External Wallet 1' }
    ])

    const element: W3mConnectExternalWidget = await fixture(
      html`<w3m-connect-external-widget></w3m-connect-external-widget>`
    )

    const walletElements = element.shadowRoot?.querySelectorAll('wui-list-wallet')
    expect(walletElements?.length).toBe(2)

    const walletNames = Array.from(walletElements || []).map(el => el.getAttribute('name'))

    expect(walletNames).not.toContain('External Wallet 1')
    expect(walletNames).toContain('External Wallet 2')
    expect(walletNames).toContain('External Wallet 3')
  })

  it('should filter out wallets excluded by name while showing non-excluded wallets', async () => {
    vi.spyOn(ApiController.state, 'excludedWallets', 'get').mockReturnValue([
      { rdns: '', name: 'External Wallet 2' }
    ])

    const element: W3mConnectExternalWidget = await fixture(
      html`<w3m-connect-external-widget></w3m-connect-external-widget>`
    )

    const walletElements = element.shadowRoot?.querySelectorAll('wui-list-wallet')
    expect(walletElements?.length).toBe(2)

    const walletNames = Array.from(walletElements || []).map(el => el.getAttribute('name'))

    expect(walletNames).not.toContain('External Wallet 2')
    expect(walletNames).toContain('External Wallet 1')
    expect(walletNames).toContain('External Wallet 3')
  })
})
