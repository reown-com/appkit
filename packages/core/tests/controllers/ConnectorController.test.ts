import { beforeAll, describe, expect, it, vi } from 'vitest'
import {
  ChainController,
  ConnectorController,
  OptionsController,
  type Metadata,
  type SdkVersion,
  type ThemeMode,
  type ThemeVariables
} from '../../exports/index.js'
import { ConstantsUtil, getW3mThemeVariables } from '@reown/appkit-common'

// -- Setup --------------------------------------------------------------------
const evmAuthProvider = {
  syncDappData: (_args: { metadata: Metadata; sdkVersion: SdkVersion; projectId: string }) =>
    Promise.resolve(),
  syncTheme: (_args: { themeMode: ThemeMode; themeVariables: ThemeVariables }) => Promise.resolve()
} as const

const caipNetwork = {
  id: 'eip155:1',
  name: 'Ethereum',
  chainNamespace: ConstantsUtil.CHAIN.EVM,
  chainId: 1,
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://rpc.infura.com/v1/'
} as const

const walletConnectConnector = {
  id: 'walletConnect',
  explorerId: 'walletConnectId',
  type: 'WALLET_CONNECT',
  chain: ConstantsUtil.CHAIN.EVM,
  name: 'WalletConnect'
} as const
const externalConnector = {
  id: 'external',
  type: 'EXTERNAL',
  chain: ConstantsUtil.CHAIN.EVM,
  name: 'External'
} as const
const evmAuthConnector = {
  id: 'w3mAuth',
  type: 'AUTH',
  provider: evmAuthProvider,
  chain: ConstantsUtil.CHAIN.EVM,
  name: 'Auth'
} as const

const announcedConnector = {
  id: 'announced',
  type: 'ANNOUNCED',
  info: { rdns: 'announced.io' },
  chain: ConstantsUtil.CHAIN.EVM,
  name: 'Announced'
} as const

const syncDappDataSpy = vi.spyOn(evmAuthProvider, 'syncDappData')
const syncThemeSpy = vi.spyOn(evmAuthProvider, 'syncTheme')

const mockDappData = {
  metadata: {
    description: 'Desc',
    name: 'Name',
    url: 'url.com',
    icons: ['icon.png']
  },
  projectId: '1234',
  sdkVersion: 'react-wagmi-4.0.13' as SdkVersion,
  sdkType: 'appkit'
}
const metamaskConnector = {
  id: 'metamask',
  type: 'INJECTED',
  info: { rdns: 'io.metamask.com' },
  chain: ConstantsUtil.CHAIN.EVM,
  name: 'MetaMask'
} as const
const zerionConnector = {
  id: 'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18',
  type: 'INJECTED',
  chain: ConstantsUtil.CHAIN.EVM,
  name: 'Zerion'
} as const

// -- Tests --------------------------------------------------------------------
describe('ConnectorController', () => {
  beforeAll(() => {
    ChainController.state.activeChain = ConstantsUtil.CHAIN.EVM
    ChainController.state.activeCaipNetwork = caipNetwork
  })
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
    expect(ConnectorController.getConnector('walletConnectId', '')).toStrictEqual(
      walletConnectConnector
    )
    expect(ConnectorController.getConnector('', 'io.metamask.com')).toStrictEqual(metamaskConnector)
    expect(ConnectorController.getConnector(zerionConnector.id, '')).toBeUndefined()
    expect(ConnectorController.getConnector('unknown', '')).toBeUndefined()
  })

  it('getAuthConnector() should not throw when auth connector is not set', () => {
    const connector = ConnectorController.getAuthConnector()
    expect(connector).toEqual(undefined)
  })

  it('should trigger corresponding sync methods when adding auth connector', () => {
    OptionsController.setMetadata(mockDappData.metadata)
    OptionsController.setSdkVersion(mockDappData.sdkVersion)
    OptionsController.setProjectId(mockDappData.projectId)

    ConnectorController.addConnector(evmAuthConnector)
    expect(ConnectorController.state.connectors).toEqual([
      walletConnectConnector,
      externalConnector,
      metamaskConnector,
      zerionConnector,
      evmAuthConnector
    ])

    expect(syncDappDataSpy).toHaveBeenCalledWith(mockDappData)
    expect(syncThemeSpy).toHaveBeenCalledWith({
      themeMode: 'dark',
      themeVariables: {},
      w3mThemeVariables: getW3mThemeVariables({}, 'dark')
    })
  })

  it('getAuthConnector() should return appropiate authconnector when already added', () => {
    const connector = ConnectorController.getAuthConnector()
    expect(connector).toEqual(evmAuthConnector)
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
      evmAuthConnector,
      // Need to define inline to reference the spies

      announcedConnector
    ])
  })
})
