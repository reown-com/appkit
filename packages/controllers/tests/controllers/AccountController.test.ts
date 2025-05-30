import { mainnet } from 'viem/chains'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { type Balance, type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'

import {
  AccountController,
  BlockchainApiController,
  ChainController,
  type ChainControllerState,
  type ConnectionControllerClient,
  ConnectorController,
  CoreHelperUtil,
  type NetworkControllerClient,
  SnackController,
  StorageUtil,
  SwapController
} from '../../exports/index.js'

// -- Setup --------------------------------------------------------------------
const caipAddress = 'eip155:1:0x123'
const balance = '0.100'
const balanceSymbol = 'ETH'
const profileName = 'john.eth'
const profileImage = 'https://ipfs.com/0x123.png'
const explorerUrl = 'https://some.explorer.com/explore'
const chain = ConstantsUtil.CHAIN.EVM
const extendedMainnet = {
  ...mainnet,
  chainNamespace: ConstantsUtil.CHAIN.EVM,
  caipNetworkId: 'eip155:1' as const
}
const networks = [extendedMainnet] as CaipNetwork[]

// -- Tests --------------------------------------------------------------------
describe('AccountController', () => {
  beforeAll(() => {
    ChainController.initialize(
      [
        {
          namespace: ConstantsUtil.CHAIN.EVM,
          caipNetworks: networks
        }
      ],
      networks,
      {
        connectionControllerClient: vi.fn() as unknown as ConnectionControllerClient,
        networkControllerClient: vi.fn() as unknown as NetworkControllerClient
      }
    )
  })

  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should have valid default state', () => {
    expect(AccountController.state).toEqual({
      smartAccountDeployed: false,
      currentTab: 0,
      tokenBalance: [],
      allAccounts: [],
      addressLabels: new Map<string, string>()
    })
  })

  it('should update state correctly on setCaipAddress()', () => {
    AccountController.setCaipAddress(caipAddress, chain)
    expect(AccountController.state.caipAddress).toEqual(caipAddress)
    expect(AccountController.state.address).toEqual('0x123')
  })

  it('should update state correctly on setBalance()', () => {
    AccountController.setBalance(balance, balanceSymbol, chain)
    expect(AccountController.state.balance).toEqual(balance)
    expect(AccountController.state.balanceSymbol).toEqual(balanceSymbol)
  })

  it('should update state correctly on setProfileName()', () => {
    AccountController.setProfileName(profileName, chain)
    expect(AccountController.state.profileName).toEqual(profileName)
  })

  it('should update state correctly on setProfileImage()', () => {
    AccountController.setProfileImage(profileImage, chain)
    expect(AccountController.state.profileImage).toEqual(profileImage)
  })

  it('should update state correctly on setAddressExplorerUrl()', () => {
    AccountController.setAddressExplorerUrl(explorerUrl, chain)
    expect(AccountController.state.addressExplorerUrl).toEqual(explorerUrl)
  })

  it('shuold update state correctly on setSmartAccountDeployed()', () => {
    AccountController.setSmartAccountDeployed(true, chain)
    expect(AccountController.state.smartAccountDeployed).toEqual(true)
  })

  it('should update state correctly on setPreferredAccountType()', () => {
    AccountController.setPreferredAccountType('eoa', chain)
    expect(AccountController.state.preferredAccountTypes).toEqual({
      eip155: 'eoa'
    })

    AccountController.setPreferredAccountType('smartAccount', chain)
    expect(AccountController.state.preferredAccountTypes).toEqual({
      eip155: 'smartAccount'
    })
  })

  it('should update state correctly on resetAccount()', () => {
    AccountController.resetAccount(chain)
    expect(AccountController.state).toEqual({
      smartAccountDeployed: false,
      currentTab: 0,
      caipAddress: undefined,
      address: undefined,
      balance: undefined,
      balanceSymbol: undefined,
      profileName: undefined,
      profileImage: undefined,
      addressExplorerUrl: undefined,
      tokenBalance: [],
      allAccounts: [],
      addressLabels: new Map<string, string>(),
      connectedWalletInfo: undefined,
      farcasterUrl: undefined,
      preferredAccountType: undefined,
      socialProvider: undefined,
      status: 'disconnected',
      user: undefined
    })
  })

  describe('fetchTokenBalance()', () => {
    beforeEach(() => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: extendedMainnet,
        activeCaipAddress: 'eip155:1:0x123'
      } as unknown as ChainControllerState)
      vi.spyOn(BlockchainApiController, 'getBalance').mockResolvedValue({
        balances: []
      })
      vi.spyOn(CoreHelperUtil, 'isAllowedRetry').mockReturnValue(true)
      vi.spyOn(SnackController, 'showError').mockImplementation(() => {})
    })

    it('should not fetch balance if its not allowed to retry', async () => {
      vi.spyOn(CoreHelperUtil, 'isAllowedRetry').mockReturnValue(false)
      AccountController.state.lastRetry = Date.now()

      const result = await AccountController.fetchTokenBalance()

      expect(result).toEqual([])
      expect(BlockchainApiController.getBalance).not.toHaveBeenCalled()
      expect(AccountController.state.balanceLoading).toBe(false)
    })

    it('should not fetch balance if chainId is not defined', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: {
          chainNamespace: 'eip155'
        } as unknown as CaipNetwork,
        activeCaipAddress: 'eip155:1:0x123'
      } as unknown as ChainControllerState)

      const result = await AccountController.fetchTokenBalance()

      expect(result).toEqual([])
      expect(BlockchainApiController.getBalance).not.toHaveBeenCalled()
    })

    it('should not fetch balance if namespace is not defined', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: { ...extendedMainnet, chainNamespace: undefined },
        activeCaipAddress: 'eip155:1:0x123'
      } as unknown as ChainControllerState)

      const result = await AccountController.fetchTokenBalance()

      expect(result).toEqual([])
      expect(BlockchainApiController.getBalance).not.toHaveBeenCalled()
    })

    it('should not fetch balance if address is not defined', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: extendedMainnet,
        activeCaipAddress: undefined
      } as unknown as ChainControllerState)

      const result = await AccountController.fetchTokenBalance()

      expect(result).toEqual([])
      expect(BlockchainApiController.getBalance).not.toHaveBeenCalled()
    })

    it('should set the retry if something fails', async () => {
      const mockError = new Error('API Error')
      vi.spyOn(BlockchainApiController, 'getBalance').mockRejectedValue(mockError)
      const onError = vi.fn()

      const now = Date.now()
      vi.setSystemTime(now)
      vi.spyOn(ConnectorController, 'getConnectorId').mockReturnValue(
        ConstantsUtil.CONNECTOR_ID.INJECTED
      )
      vi.spyOn(StorageUtil, 'getBalanceCacheForCaipAddress').mockReturnValue(undefined)
      AccountController.setCaipAddress(caipAddress, chain)

      const result = await AccountController.fetchTokenBalance(onError)

      expect(result).toEqual([])
      expect(AccountController.state.lastRetry).toBe(now)
      expect(onError).toHaveBeenCalledWith(mockError)
      expect(SnackController.showError).toHaveBeenCalledWith('Token Balance Unavailable')
    })

    it('should fetch balance if everything is correct', async () => {
      const mockBalances = [
        {
          quantity: { decimals: '18' },
          symbol: 'ETH'
        },
        { quantity: { decimals: '0' }, symbol: 'ZERO' },
        { quantity: { decimals: '6' }, symbol: 'USDC' }
      ]

      vi.spyOn(BlockchainApiController, 'getBalance').mockResolvedValue({
        balances: mockBalances as Balance[]
      })

      const setTokenBalanceSpy = vi.spyOn(AccountController, 'setTokenBalance')
      const setBalancesSpy = vi.spyOn(SwapController, 'setBalances')
      const result = await AccountController.fetchTokenBalance()

      expect(result).toEqual([
        { quantity: { decimals: '18' }, symbol: 'ETH' },
        { quantity: { decimals: '6' }, symbol: 'USDC' }
      ])
      expect(setTokenBalanceSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          { quantity: { decimals: '18' }, symbol: 'ETH' },
          { quantity: { decimals: '6' }, symbol: 'USDC' }
        ]),
        'eip155'
      )
      expect(setBalancesSpy).not.toHaveBeenCalled()
      expect(AccountController.state.lastRetry).toBeUndefined()
      expect(AccountController.state.balanceLoading).toBe(false)
    })
  })
})
