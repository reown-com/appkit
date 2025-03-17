import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { App } from 'vue'
import { createApp, nextTick } from 'vue'

import { AccountController, ChainController, ConnectorController } from '../../exports/index.js'
import { useAppKitAccount } from '../../exports/vue.js'
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
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue({} as any)

    await nextTick()

    expect(state.value).toEqual(connectedWithEmbeddedWalletState)
  })
})
