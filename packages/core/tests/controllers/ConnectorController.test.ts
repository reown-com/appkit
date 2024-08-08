import { describe, expect, it, vi } from 'vitest'
import {
  ConnectorController,
  OptionsController,
  type Metadata,
  type SdkVersion,
  type ThemeMode,
  type ThemeVariables
} from '../../index.js'
import { ConstantsUtil, getW3mThemeVariables } from '@web3modal/common'

// -- Setup --------------------------------------------------------------------
const authProvider = {
  syncDappData: (_args: { metadata: Metadata; sdkVersion: SdkVersion; projectId: string }) =>
    Promise.resolve(),
  syncTheme: (_args: { themeMode: ThemeMode; themeVariables: ThemeVariables }) => Promise.resolve()
}

const walletConnectConnector = {
  id: 'walletConnect',
  explorerId: 'walletConnectId',
  type: 'WALLET_CONNECT',
  chain: ConstantsUtil.CHAIN.EVM
} as const
const externalConnector = {
  id: 'external',
  type: 'EXTERNAL',
  chain: ConstantsUtil.CHAIN.EVM
} as const
const authConnector = {
  id: 'w3mAuth',
  type: 'AUTH',
  provider: authProvider,
  chain: ConstantsUtil.CHAIN.EVM
} as const
const announcedConnector = {
  id: 'announced',
  type: 'ANNOUNCED',
  info: { rdns: 'announced.io' },
  chain: ConstantsUtil.CHAIN.EVM
} as const

const syncDappDataSpy = vi.spyOn(authProvider, 'syncDappData')
const syncThemeSpy = vi.spyOn(authProvider, 'syncTheme')

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
  info: { rdns: 'io.metamask.com' },
  chain: ConstantsUtil.CHAIN.EVM
} as const
const zerionConnector = {
  id: 'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18',
  type: 'INJECTED',
  chain: ConstantsUtil.CHAIN.EVM
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

  it('getAuthConnector() should not throw when auth connector is not set', () => {
    expect(ConnectorController.getAuthConnector()).toEqual(undefined)
  })

  it('should trigger corresponding sync methods when adding auth connector', () => {
    OptionsController.setMetadata(mockDappData.metadata)
    OptionsController.setSdkVersion(mockDappData.sdkVersion)
    OptionsController.setProjectId(mockDappData.projectId)

    ConnectorController.addConnector(authConnector)
    expect(ConnectorController.state.connectors).toEqual([
      walletConnectConnector,
      externalConnector,
      metamaskConnector,
      zerionConnector,
      authConnector
    ])

    expect(syncDappDataSpy).toHaveBeenCalledWith(mockDappData)
    expect(syncThemeSpy).toHaveBeenCalledWith({
      themeMode: 'dark',
      themeVariables: {},
      w3mThemeVariables: getW3mThemeVariables({}, 'dark')
    })
  })

  it('getAuthConnector() should return authconnector when already added', () => {
    expect(ConnectorController.getAuthConnector()).toEqual(authConnector)
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
      authConnector,
      announcedConnector
    ])
  })
})
