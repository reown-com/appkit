import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { App } from 'vue'
import { createApp, nextTick } from 'vue'

import { ConstantsUtil } from '@reown/appkit-common'

import {
  AccountController,
  type AuthConnector,
  ChainController,
  ConnectionController,
  ConnectorController,
  StorageUtil
} from '../../exports/index.js'
import { useAppKitAccount, useDisconnect } from '../../exports/vue.js'
import {
  mockChainControllerState,
  mockResetChainControllerState
} from '../mocks/ChainController.js'
import {
  connectedAccountState,
  connectedWithEmbeddedWalletState,
  defaultAccountState,
  disconnectedAccountState
} from '../mocks/useAppKitAccount.js'

export function withSetup<T>(composable: () => T): [T, App] {
  let result: T
  const app = createApp({
    setup() {
      result = composable()
      return () => {}
    }
  })

  app.mount(document.createElement('div'))
  // @ts-expect-error ignore used before reassigned error
  return [result, app]
}

describe('useAppKitAccount', () => {
  beforeAll(() => {
    mockChainControllerState()
  })

  afterAll(() => {
    mockResetChainControllerState()
  })

  it('should have default state when initialized', () => {
    const [state] = withSetup(() => useAppKitAccount())

    expect(state.value).toEqual(defaultAccountState)
  })

  it('should return the correct account state when connected', async () => {
    const [state] = withSetup(() => useAppKitAccount())

    AccountController.setCaipAddress('eip155:1:0x123...', 'eip155')
    AccountController.setStatus('connected', 'eip155')

    await nextTick()

    expect(state.value).toEqual(connectedAccountState)
  })

  it('should return the correct account state when disconnected', async () => {
    const [state] = withSetup(() => useAppKitAccount())

    ChainController.resetAccount('eip155')
    AccountController.setStatus('disconnected', 'eip155')

    await nextTick()

    expect(state.value).toEqual(disconnectedAccountState)
  })

  it('should return correct embedded wallet info when connected with social provider', async () => {
    const [state] = withSetup(() => useAppKitAccount())

    AccountController.setCaipAddress('eip155:1:0x123...', 'eip155')
    AccountController.setStatus('connected', 'eip155')
    AccountController.setUser({ username: 'test', email: 'testuser@example.com' }, 'eip155')
    AccountController.setSmartAccountDeployed(true, 'eip155')
    AccountController.setPreferredAccountType('smartAccount', 'eip155')
    const authConnector = {
      id: ConstantsUtil.CONNECTOR_ID.AUTH,
      type: 'ID_AUTH'
    } as AuthConnector
    ConnectorController.state.connectors = [authConnector]
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('ID_AUTH')

    await nextTick()

    expect(state.value).toEqual(connectedWithEmbeddedWalletState)
  })

  it('should return account state with namespace parameter', async () => {
    ConnectorController.state.connectors = []
    const [state] = withSetup(() => useAppKitAccount({ namespace: 'solana' }))

    await nextTick()

    expect(state.value).toEqual({
      allAccounts: [],
      address: undefined,
      caipAddress: undefined,
      isConnected: false,
      status: undefined,
      embeddedWalletInfo: undefined
    })
  })
})

describe('useDisconnect', () => {
  it('should disconnect as expected', async () => {
    const disconnectSpy = vi.spyOn(ConnectionController, 'disconnect')

    const { disconnect } = useDisconnect()

    await disconnect()

    expect(disconnectSpy).toHaveBeenCalled()
  })

  it('should disconnect for specific namespace as expected', async () => {
    const disconnectSpy = vi.spyOn(ConnectionController, 'disconnect')

    const { disconnect } = useDisconnect()

    await disconnect({ namespace: 'solana' })

    expect(disconnectSpy).toHaveBeenCalledWith('solana')
  })
})
