import { describe, expect, it, vi } from 'vitest'
import {
  ConnectorController,
  OptionsController,
  type Metadata,
  type SdkVersion,
  type ThemeMode,
  type ThemeVariables
} from '../../index.js'

// -- Setup --------------------------------------------------------------------
const emailProvider = {
  syncDappData: (_args: { metadata: Metadata; sdkVersion: SdkVersion; projectId: string }) =>
    Promise.resolve(),
  syncTheme: (_args: { themeMode: ThemeMode; themeVariables: ThemeVariables }) => Promise.resolve()
}

const walletConnectConnector = {
  id: 'walletConnect',
  explorerId: 'walletConnectId',
  type: 'WALLET_CONNECT'
} as const
const externalConnector = { id: 'external', type: 'EXTERNAL' } as const
const emailConnector = { id: 'w3mEmail', type: 'EMAIL', provider: emailProvider } as const
const announcedConnector = {
  id: 'announced',
  type: 'ANNOUNCED',
  info: { rdns: 'announced.io' }
} as const

const syncDappDataSpy = vi.spyOn(emailProvider, 'syncDappData')
const syncThemeSpy = vi.spyOn(emailProvider, 'syncTheme')

const mockDappData = {
  metadata: {
    description: 'Desc',
    name: 'Name',
    url: 'url.com',
    icons: ['icon.png']
  },
  projectId: '1234',
  sdkVersion: 'react-wagmi-4.0.13' as SdkVersion
}
const metamaskConnector = {
  id: 'metamask',
  type: 'INJECTED',
  info: { rdns: 'io.metamask.com' }
} as const
const zerionConnector = {
  id: 'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18',
  type: 'INJECTED'
} as const
// -- Tests --------------------------------------------------------------------
describe('ConnectorController', () => {
  it('should have valid default state', () => {
    expect(ConnectorController.state.connectors).toEqual([])
  })

  it('should update state correctly on setConnectors()', () => {
    ConnectorController.setConnectors([walletConnectConnector])
    expect(ConnectorController.state.connectors).toEqual([walletConnectConnector])
  })

  it('should update state correctly on addConnector()', () => {
    ConnectorController.addConnector(externalConnector)
    expect(ConnectorController.state.connectors).toEqual([
      walletConnectConnector,
      externalConnector
    ])

    ConnectorController.addConnector(metamaskConnector)
    expect(ConnectorController.state.connectors).toEqual([
      walletConnectConnector,
      externalConnector,
      metamaskConnector
    ])
  })

  it('should return the correct connector on getConnector', () => {
    ConnectorController.addConnector(zerionConnector)
    expect(ConnectorController.getConnector('walletConnectId', '')).toBe(walletConnectConnector)
    expect(ConnectorController.getConnector('', 'io.metamask.com')).toBe(metamaskConnector)
    expect(ConnectorController.getConnector(zerionConnector.id, '')).toBeUndefined()
    expect(ConnectorController.getConnector('unknown', '')).toBeUndefined()
  })

  it('getEmailConnector() should not throw when email connector is not set', () => {
    expect(ConnectorController.getEmailConnector()).toEqual(undefined)
  })

  it('should trigger corresponding sync methods when adding email connector', () => {
    OptionsController.setMetadata(mockDappData.metadata)
    OptionsController.setSdkVersion(mockDappData.sdkVersion)
    OptionsController.setProjectId(mockDappData.projectId)

    ConnectorController.addConnector(emailConnector)
    expect(ConnectorController.state.connectors).toEqual([
      walletConnectConnector,
      externalConnector,
      metamaskConnector,
      zerionConnector,
      emailConnector
    ])

    expect(syncDappDataSpy).toHaveBeenCalledWith(mockDappData)
    expect(syncThemeSpy).toHaveBeenCalledWith({ themeMode: 'dark', themeVariables: {} })
  })

  it('getEmailConnector() should return emailconnector when already added', () => {
    expect(ConnectorController.getEmailConnector()).toEqual(emailConnector)
  })

  it('getAnnouncedConnectorRdns() should not throw when no announced connector is not set', () => {
    expect(ConnectorController.getAnnouncedConnectorRdns()).toEqual([])
  })

  it('getAnnouncedConnectorRdns() should return corresponding info array', () => {
    ConnectorController.addConnector(announcedConnector)
    expect(ConnectorController.getAnnouncedConnectorRdns()).toEqual(['announced.io'])
  })

  it('getConnnectors() should return all connectors', () => {
    expect(ConnectorController.getConnectors()).toEqual([
      walletConnectConnector,
      externalConnector,
      metamaskConnector,
      zerionConnector,
      emailConnector,
      announcedConnector
    ])
  })
})
