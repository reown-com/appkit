import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiController, ConnectorController, ModalController } from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { mockOptions } from '../mocks/Options.js'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Modal Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockUniversalProvider as any)
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockResolvedValue(['http://localhost:3000'])
  })

  it('should open modal', async () => {
    const prefetch = vi.spyOn(ApiController, 'prefetch').mockResolvedValueOnce([])
    const open = vi.spyOn(ModalController, 'open')

    const appKit = new AppKit(mockOptions)

    await appKit.open()

    expect(open).toHaveBeenCalled()
    expect(prefetch).toHaveBeenCalled()
  })

  it('should open different views', async () => {
    const modelOpen = vi.spyOn(ModalController, 'open')

    const views = [
      'Account',
      'Connect',
      'Networks',
      'ApproveTransaction',
      'OnRampProviders',
      'ConnectingWalletConnectBasic',
      'Swap',
      'WhatIsAWallet',
      'WhatIsANetwork',
      'AllWallets',
      'WalletSend'
    ] as const

    const appkit = new AppKit(mockOptions)

    for (const view of views) {
      await appkit.open({ view })
      expect(modelOpen).toHaveBeenCalledWith({ view })
    }
  })

  it.each([
    {
      view: 'Swap',
      viewArguments: { fromToken: 'USDC', toToken: 'ETH', amount: '100' },
      data: { swap: { fromToken: 'USDC', toToken: 'ETH', amount: '100' } }
    }
  ] as const)('should open swap view with arguments', async ({ view, viewArguments, data }) => {
    const open = vi.spyOn(ModalController, 'open')

    const appkit = new AppKit(mockOptions)
    await appkit.open({
      view,
      arguments: viewArguments
    })

    expect(open).toHaveBeenCalledWith(
      expect.objectContaining({
        view,
        data
      })
    )
  })

  it('should filter connectors by namespace when opening modal', async () => {
    const openSpy = vi.spyOn(ModalController, 'open')
    const setFilterByNamespaceSpy = vi.spyOn(ConnectorController, 'setFilterByNamespace')

    const appKit = new AppKit(mockOptions)

    await appKit.open({ view: 'Connect', namespace: 'eip155' })

    expect(openSpy).toHaveBeenCalled()
    expect(setFilterByNamespaceSpy).toHaveBeenCalledWith('eip155')
  })

  it('should close modal', async () => {
    const close = vi.spyOn(ModalController, 'close')

    const appKit = new AppKit(mockOptions)
    await appKit.close()

    expect(close).toHaveBeenCalled()
  })

  it('should set loading state', () => {
    const setLoading = vi.spyOn(ModalController, 'setLoading')

    const appKit = new AppKit(mockOptions)
    appKit.setLoading(true)

    expect(setLoading).toHaveBeenCalledWith(true, undefined)
  })

  it('should check if modal is open', async () => {
    vi.spyOn(AppKit.prototype as any, 'injectModalUi').mockResolvedValueOnce(vi.fn())

    const appKit = new AppKit(mockOptions)
    await appKit.open()

    expect(appKit.isOpen()).toBe(true)
  })

  it('should check if transaction stack is empty', () => {
    const appKit = new AppKit(mockOptions)

    expect(appKit.isTransactionStackEmpty()).toBe(true)
  })
})
