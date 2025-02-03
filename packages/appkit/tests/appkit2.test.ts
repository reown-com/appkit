import { afterEach, describe, expect, it, vi } from 'vitest'

import type { AccountControllerState, Connector } from '@reown/appkit'
import {
  type Balance,
  type CaipNetwork,
  SafeLocalStorage,
  SafeLocalStorageKeys,
  getSafeConnectorIdKey
} from '@reown/appkit-common'
import {
  AccountController,
  AssetUtil,
  BlockchainApiController,
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EnsController,
  EventsController,
  ModalController,
  OptionsController,
  PublicStateController,
  RouterController,
  SnackController,
  StorageUtil,
  ThemeController
} from '@reown/appkit-core'

import { AppKit } from '../src/client'
import { ProviderUtil } from '../src/store'
import mockUniversalAdapter from './mocks/Adapter'
import {
  base,
  mainnet,
  mockAuthProvider,
  mockEvmAdapter,
  mockOptions,
  mockSolanaAdapter,
  polygon,
  sepolia,
  solana
} from './mocks/Options'

// Mock all controllers and UniversalAdapterClient
vi.mock('../src/universal-adapter/client')

vi.mocked(global).window = { location: { origin: '' } } as any
vi.mocked(global).document = {
  body: {
    insertAdjacentElement: vi.fn()
  } as any,
  createElement: vi.fn().mockReturnValue({ appendChild: vi.fn() }),
  getElementsByTagName: vi.fn().mockReturnValue([{ textContent: '' }]),
  querySelector: vi.fn()
} as any

/**
 * In the initializeBlockchainApiController method, we call the getSupportedNetworks method.
 * This method is mocked to return the mainnet and polygon networks.
 */
vi.spyOn(BlockchainApiController, 'getSupportedNetworks').mockResolvedValue({
  http: ['eip155:1', 'eip155:137'],
  ws: ['eip155:1', 'eip155:137']
})
/**
 * Make the StorageUtil return the mainnet network by default.
 * Depending on the specific cases, this might be overriden.
 */
vi.spyOn(StorageUtil, 'getActiveNetworkProps').mockReturnValue({
  namespace: mainnet.chainNamespace,
  caipNetworkId: mainnet.caipNetworkId,
  chainId: mainnet.id
})

describe('Base', () => {
  describe('Base Public methods', () => {
    it('should open modal', async () => {
      const open = vi.spyOn(ModalController, 'open')

      const appKit = new AppKit(mockOptions)
      await appKit.open()

      expect(open).toHaveBeenCalled()
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

      expect(setLoading).toHaveBeenCalledWith(true)
    })

    it('should get theme mode', () => {
      vi.spyOn(ThemeController.state, 'themeMode', 'get').mockReturnValueOnce('dark')

      const appKit = new AppKit(mockOptions)

      expect(appKit.getThemeMode()).toBe('dark')
    })

    it('should set theme mode', () => {
      const setThemeMode = vi.spyOn(ThemeController, 'setThemeMode')

      const appKit = new AppKit(mockOptions)
      appKit.setThemeMode('light')

      expect(setThemeMode).toHaveBeenCalledWith('light')
    })

    it('should get theme variables', () => {
      vi.spyOn(ThemeController.state, 'themeVariables', 'get').mockReturnValueOnce({
        '--w3m-accent': '#000'
      })

      const appKit = new AppKit(mockOptions)

      expect(appKit.getThemeVariables()).toEqual({ '--w3m-accent': '#000' })
    })

    it('should set theme variables', () => {
      const setThemeVariables = vi.spyOn(ThemeController, 'setThemeVariables')

      const appKit = new AppKit(mockOptions)
      const themeVariables = { '--w3m-accent': '#fff' }
      appKit.setThemeVariables(themeVariables)

      expect(setThemeVariables).toHaveBeenCalledWith(themeVariables)
    })

    it('should subscribe to theme changes', () => {
      const subscribe = vi.spyOn(ThemeController, 'subscribe')
      const callback = vi.fn()

      const appKit = new AppKit(mockOptions)
      appKit.subscribeTheme(callback)

      expect(subscribe).toHaveBeenCalledWith(callback)
    })

    it('should get wallet info', () => {
      const appKit = new AppKit(mockOptions)
      appKit.setConnectedWalletInfo({ name: 'Test Wallet' }, 'eip155')

      expect(appKit.getWalletInfo()).toEqual({ name: 'Test Wallet' })
    })

    it('should subscribe to wallet info changes', () => {
      const subscribe = vi.spyOn(AccountController, 'subscribeKey')
      const callback = vi.fn()

      const appKit = new AppKit(mockOptions)
      appKit.subscribeWalletInfo(callback)

      expect(subscribe).toHaveBeenCalledWith('connectedWalletInfo', callback)
    })

    it('should subscribe to address updates', () => {
      const subscribe = vi.spyOn(AccountController, 'subscribeKey')
      const callback = vi.fn()

      const appKit = new AppKit(mockOptions)
      appKit.subscribeShouldUpdateToAddress(callback)

      expect(subscribe).toHaveBeenCalledWith('shouldUpdateToAddress', callback)
    })

    it('should subscribe to CAIP network changes', () => {
      const subscribeKey = vi.spyOn(ChainController, 'subscribeKey')
      const callback = vi.fn()

      const appKit = new AppKit(mockOptions)
      appKit.subscribeCaipNetworkChange(callback)

      expect(subscribeKey).toHaveBeenCalledWith('activeCaipNetwork', callback)
    })

    it('should subscribe to state changes', () => {
      const subscribe = vi.spyOn(PublicStateController, 'subscribe')
      const callback = vi.fn()

      const appKit = new AppKit(mockOptions)
      appKit.subscribeState(callback)

      expect(subscribe).toHaveBeenCalledWith(callback)
    })

    it('should show error message', () => {
      const showError = vi.spyOn(SnackController, 'showError')

      const appKit = new AppKit(mockOptions)
      appKit.showErrorMessage('Test error')

      expect(showError).toHaveBeenCalledWith('Test error')
    })

    it('should show success message', () => {
      const showSuccess = vi.spyOn(SnackController, 'showSuccess')

      const appKit = new AppKit(mockOptions)
      appKit.showSuccessMessage('Test success')

      expect(showSuccess).toHaveBeenCalledWith('Test success')
    })

    it('should get event', () => {
      const appKit = new AppKit(mockOptions)

      expect(appKit.getEvent()).toEqual(EventsController.state)
    })

    it('should subscribe to events', () => {
      const subscribe = vi.spyOn(EventsController, 'subscribe')
      const callback = vi.fn()

      const appKit = new AppKit(mockOptions)
      appKit.subscribeEvents(callback)

      expect(subscribe).toHaveBeenCalledWith(callback)
    })

    it('should replace route', () => {
      const replace = vi.spyOn(RouterController, 'replace')

      const appKit = new AppKit(mockOptions)
      appKit.replace('Connect')

      expect(replace).toHaveBeenCalledWith('Connect')
    })

    it('should redirect to route', () => {
      const push = vi.spyOn(RouterController, 'push')

      const appKit = new AppKit(mockOptions)
      appKit.redirect('Networks')

      expect(push).toHaveBeenCalledWith('Networks')
    })

    it('should pop transaction stack', () => {
      const popTransactionStack = vi.spyOn(RouterController, 'popTransactionStack')

      const appKit = new AppKit(mockOptions)
      appKit.popTransactionStack(true)

      expect(popTransactionStack).toHaveBeenCalledWith(true)
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

    it('should set status', () => {
      const setStatus = vi.spyOn(AccountController, 'setStatus')

      const appKit = new AppKit(mockOptions)
      appKit.setStatus('connected', 'eip155')

      expect(setStatus).toHaveBeenCalledWith('connected', 'eip155')
    })

    it('should set all accounts', () => {
      const setAllAccounts = vi.spyOn(AccountController, 'setAllAccounts')
      const setHasMultipleAddresses = vi.spyOn(OptionsController, 'setHasMultipleAddresses')
      const evmAddresses = [
        { address: '0x1', namespace: 'eip155', type: 'eoa' } as const,
        { address: '0x2', namespace: 'eip155', type: 'smartAccount' } as const
      ]
      const solanaAddresses = [{ address: 'asdbjk', namespace: 'solana', type: 'eoa' } as const]
      const bip122Addresses = [
        { address: 'asdasd1', namespace: 'bip122', type: 'payment' } as const,
        { address: 'asdasd2', namespace: 'bip122', type: 'ordinal' } as const,
        { address: 'ASDASD3', namespace: 'bip122', type: 'stx' } as const
      ]

      const appKit = new AppKit(mockOptions)
      appKit.setAllAccounts(evmAddresses, 'eip155')
      appKit.setAllAccounts(solanaAddresses, 'solana')
      appKit.setAllAccounts(bip122Addresses, 'bip122')

      expect(setAllAccounts).toHaveBeenCalledWith(evmAddresses, 'eip155')
      expect(setAllAccounts).toHaveBeenCalledWith(solanaAddresses, 'solana')
      expect(setAllAccounts).toHaveBeenCalledWith(bip122Addresses, 'bip122')
      expect(setHasMultipleAddresses).toHaveBeenCalledWith(true)
    })

    it('should add address label', () => {
      const addAddressLabel = vi.spyOn(AccountController, 'addAddressLabel')

      const appKit = new AppKit(mockOptions)
      appKit.addAddressLabel('0x123', 'eip155 Address', 'eip155')

      expect(addAddressLabel).toHaveBeenCalledWith('0x123', 'eip155 Address', 'eip155')
    })

    it('should remove address label', () => {
      const removeAddressLabel = vi.spyOn(AccountController, 'removeAddressLabel')

      const appKit = new AppKit(mockOptions)
      appKit.removeAddressLabel('0x123', 'eip155')

      expect(removeAddressLabel).toHaveBeenCalledWith('0x123', 'eip155')
    })

    it('should get address and CAIP address', async () => {
      const mockAccountData = {
        address: '0x123',
        chainId: mainnet.id,
        chainNamespace: mainnet.chainNamespace
      }

      const appKit = new AppKit(mockOptions)
      await appKit['syncAccount'](mockAccountData)

      expect(appKit.getAddress()).toBe('0x123')
      expect(appKit.getCaipAddress()).toBe('eip155:1:0x123')
    })
  })
})
