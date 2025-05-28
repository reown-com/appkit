import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AuthConnector, SocialProvider } from '@reown/appkit'
import {
  AccountController,
  ApiController,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  StorageUtil
} from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { mockUser, mockUserBalance } from '../mocks/Account.js'
import { mainnet } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import { mockAuthProvider } from '../mocks/Providers.js'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('Account Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(UniversalProvider, 'init').mockResolvedValue(mockUniversalProvider as any)
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
    vi.spyOn(ApiController, 'fetchAllowedOrigins').mockResolvedValue(['http://localhost:3000'])
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
    await appKit.ready()
    await appKit['syncAccount'](mockAccountData)

    expect(appKit.getAddress()).toBe('0x123')
    expect(appKit.getCaipAddress()).toBe('eip155:1:0x123')
  })

  it('should get preferred account type', () => {
    const appKit = new AppKit(mockOptions)
    appKit.setPreferredAccountType('eoa', mainnet.chainNamespace)

    expect(appKit.getPreferredAccountType(mainnet.chainNamespace)).toBe('eoa')
  })

  it('should set CAIP address', () => {
    const setCaipAddress = vi.spyOn(AccountController, 'setCaipAddress')

    const appKit = new AppKit(mockOptions)
    appKit.setCaipAddress('eip155:1:0x123', 'eip155')

    expect(setCaipAddress).toHaveBeenCalledWith('eip155:1:0x123', 'eip155')
    expect(appKit.getIsConnectedState()).toBe(true)
  })

  it('should set balance', () => {
    const setBalance = vi.spyOn(AccountController, 'setBalance')

    const appKit = new AppKit(mockOptions)
    appKit.setBalance('1.5', 'ETH', 'eip155')

    expect(setBalance).toHaveBeenCalledWith('1.5', 'ETH', 'eip155')
  })

  it('should set profile name', () => {
    const setProfileName = vi.spyOn(AccountController, 'setProfileName')

    const appKit = new AppKit(mockOptions)
    appKit.setProfileName('John Doe', 'eip155')

    expect(setProfileName).toHaveBeenCalledWith('John Doe', 'eip155')
  })

  it('should set profile image', () => {
    const setProfileImage = vi.spyOn(AccountController, 'setProfileImage')

    const appKit = new AppKit(mockOptions)
    appKit.setProfileImage('https://example.com/image.png', 'eip155')

    expect(setProfileImage).toHaveBeenCalledWith('https://example.com/image.png', 'eip155')
  })

  it('should reset account', () => {
    const resetAccount = vi.spyOn(AccountController, 'resetAccount')

    const appKit = new AppKit(mockOptions)
    appKit.resetAccount('eip155')

    expect(resetAccount).toHaveBeenCalledWith('eip155')
  })

  it('should set preferred account type', () => {
    const setPreferredAccountType = vi.spyOn(AccountController, 'setPreferredAccountType')

    const appKit = new AppKit(mockOptions)
    appKit.setPreferredAccountType('eoa', mainnet.chainNamespace)

    expect(setPreferredAccountType).toHaveBeenCalledWith('eoa', mainnet.chainNamespace)
  })

  it('should create accounts with correct account types from user accounts', async () => {
    const createAccount = vi.spyOn(CoreHelperUtil, 'createAccount')
    const setAllAccounts = vi.spyOn(AccountController, 'setAllAccounts')
    const setPreferredAccountType = vi.spyOn(AccountController, 'setPreferredAccountType')

    const appKitWithAuth = new AppKit(mockOptions)
    ;(appKitWithAuth as any).authProvider = mockAuthProvider

    await (appKitWithAuth as any).syncAuthConnector(mockAuthProvider, mainnet.chainNamespace)

    await vi.waitFor(
      () => {
        expect(createAccount).toHaveBeenCalledWith(mainnet.chainNamespace, '0x1', 'eoa')
        expect(createAccount).toHaveBeenCalledWith(mainnet.chainNamespace, '0x2', 'smartAccount')
        expect(setAllAccounts).toHaveBeenCalledWith(
          [
            { address: '0x1', type: 'eoa', namespace: mainnet.chainNamespace },
            { address: '0x2', type: 'smartAccount', namespace: mainnet.chainNamespace }
          ],
          mainnet.chainNamespace
        )
        expect(setPreferredAccountType).toHaveBeenCalledWith('eoa', mainnet.chainNamespace)
      },
      { interval: 100, timeout: 2000 }
    )
  })

  it('should set address explorer URL', () => {
    const setAddressExplorerUrl = vi.spyOn(AccountController, 'setAddressExplorerUrl')

    const appKit = new AppKit(mockOptions)
    appKit.setAddressExplorerUrl('https://etherscan.io/address/0x123', mainnet.chainNamespace)

    expect(setAddressExplorerUrl).toHaveBeenCalledWith(
      'https://etherscan.io/address/0x123',
      mainnet.chainNamespace
    )
  })

  it('should set smart account deployed', () => {
    const setSmartAccountDeployed = vi.spyOn(AccountController, 'setSmartAccountDeployed')

    const appKit = new AppKit(mockOptions)
    appKit.setSmartAccountDeployed(true, mainnet.chainNamespace)

    expect(setSmartAccountDeployed).toHaveBeenCalledWith(true, mainnet.chainNamespace)
  })

  it('should get account information', () => {
    const authConnector = {
      id: 'ID_AUTH',
      name: 'ID Auth',
      imageUrl: 'https://example.com/id-auth.png'
    } as AuthConnector
    vi.spyOn(ConnectorController, 'getAuthConnector').mockReturnValue(authConnector)
    vi.spyOn(StorageUtil, 'getConnectedConnectorId').mockReturnValue('ID_AUTH')
    vi.spyOn(StorageUtil, 'getConnectedSocialUsername').mockReturnValue('test-username')
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      allAccounts: [{ address: '0x123', type: 'eoa', namespace: 'eip155' }],
      caipAddress: 'eip155:1:0x123',
      status: 'connected',
      user: { email: 'test@example.com' },
      socialProvider: 'email' as SocialProvider,
      preferredAccountTypes: {
        eip155: 'eoa'
      },
      smartAccountDeployed: true,
      currentTab: 0,
      addressLabels: new Map([['eip155:1:0x123', 'test-label']])
    })
    vi.spyOn(CoreHelperUtil, 'getPlainAddress')

    const appKit = new AppKit(mockOptions)
    const account = appKit.getAccount('eip155')

    expect(account).toEqual({
      allAccounts: [{ address: '0x123', type: 'eoa', namespace: 'eip155' }],
      caipAddress: 'eip155:1:0x123',
      address: '0x123',
      isConnected: true,
      status: 'connected',
      embeddedWalletInfo: {
        user: { email: 'test@example.com', username: 'test-username' },
        authProvider: 'email',
        accountType: 'eoa',
        isSmartAccountDeployed: true
      }
    })
  })

  it('should fetch balance when address, namespace, and chainId are available', async () => {
    const appKit = new AppKit(mockOptions)

    const updateNativeBalanceSpy = vi
      .spyOn(appKit, 'updateNativeBalance')
      .mockResolvedValue(mockUserBalance)

    const result = await appKit.updateNativeBalance(mockUser.address, 1, 'eip155')

    expect(updateNativeBalanceSpy).toHaveBeenCalledWith(mockUser.address, 1, 'eip155')
    expect(result).toEqual(mockUserBalance)
  })
})
