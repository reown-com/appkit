import { mainnet } from 'viem/chains'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { type Balance, type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'

import {
  BlockchainApiController,
  ChainController,
  type ChainControllerState,
  type ConnectionControllerClient,
  CoreHelperUtil,
  type NetworkControllerClient,
  SnackController,
  SwapController,
  accountState,
  fetchTokenBalance,
  resetAccount,
  setAddressExplorerUrl,
  setBalance,
  setCaipAddress,
  setPreferredAccountType,
  setProfileImage,
  setProfileName,
  setSmartAccountDeployed,
  setTokenBalance
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

describe('AccountController', () => {
  it('should have valid default state', () => {
    expect(accountState).toEqual({
      smartAccountDeployed: false,
      currentTab: 0,
      tokenBalance: [],
      allAccounts: [],
      addressLabels: new Map<string, string>()
    })
  })

  it('should update state correctly on setCaipAddress()', () => {
    setCaipAddress(caipAddress, chain)
    expect(accountState.caipAddress).toEqual(caipAddress)
    expect(accountState.address).toEqual('0x123')
  })

  it('should update state correctly on setBalance()', () => {
    setBalance(balance, balanceSymbol, chain)
    expect(accountState.balance).toEqual(balance)
    expect(accountState.balanceSymbol).toEqual(balanceSymbol)
  })

  it('should update state correctly on setProfileName()', () => {
    setProfileName(profileName, chain)
    expect(accountState.profileName).toEqual(profileName)
  })

  it('should update state correctly on setProfileImage()', () => {
    setProfileImage(profileImage, chain)
    expect(accountState.profileImage).toEqual(profileImage)
  })

  it('should update state correctly on setAddressExplorerUrl()', () => {
    setAddressExplorerUrl(explorerUrl, chain)
    expect(accountState.addressExplorerUrl).toEqual(explorerUrl)
  })

  it('shuold update state correctly on setSmartAccountDeployed()', () => {
    setSmartAccountDeployed(true, chain)
    expect(accountState.smartAccountDeployed).toEqual(true)
  })

  it('should update state correctly on setPreferredAccountType()', () => {
    setPreferredAccountType('eoa', chain)
    expect(accountState.preferredAccountType).toEqual('eoa')

    setPreferredAccountType('smartAccount', chain)
    expect(accountState.preferredAccountType).toEqual('smartAccount')
  })

  it('should update state correctly on resetAccount()', () => {
    resetAccount(chain)
    expect(accountState).toEqual({
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
      addressLabels: new Map<string, string>()
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
      accountState.lastRetry = Date.now()

      const result = await fetchTokenBalance()

      expect(result).toEqual([])
      expect(BlockchainApiController.getBalance).not.toHaveBeenCalled()
      expect(accountState.balanceLoading).toBe(false)
    })

    it('should not fetch balance if chainId is not defined', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: {
          chainNamespace: 'eip155'
        } as unknown as CaipNetwork,
        activeCaipAddress: 'eip155:1:0x123'
      } as unknown as ChainControllerState)

      const result = await fetchTokenBalance()

      expect(result).toEqual([])
      expect(BlockchainApiController.getBalance).not.toHaveBeenCalled()
    })

    it('should not fetch balance if namespace is not defined', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: { ...extendedMainnet, chainNamespace: undefined },
        activeCaipAddress: 'eip155:1:0x123'
      } as unknown as ChainControllerState)

      const result = await fetchTokenBalance()

      expect(result).toEqual([])
      expect(BlockchainApiController.getBalance).not.toHaveBeenCalled()
    })

    it('should not fetch balance if address is not defined', async () => {
      vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
        activeCaipNetwork: extendedMainnet,
        activeCaipAddress: undefined
      } as unknown as ChainControllerState)

      const result = await fetchTokenBalance()

      expect(result).toEqual([])
      expect(BlockchainApiController.getBalance).not.toHaveBeenCalled()
    })

    it('should set the retry if something fails', async () => {
      const mockError = new Error('API Error')
      vi.spyOn(BlockchainApiController, 'getBalance').mockRejectedValue(mockError)
      const onError = vi.fn()

      const now = Date.now()
      vi.setSystemTime(now)

      const result = await fetchTokenBalance(onError)

      expect(result).toEqual([])
      expect(accountState.lastRetry).toBe(now)
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

      const setTokenBalanceSpy = vi.mocked(setTokenBalance)
      const setBalancesSpy = vi.spyOn(SwapController, 'setBalances')

      const result = await fetchTokenBalance()

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
      expect(setBalancesSpy).toHaveBeenCalled()
      expect(accountState.lastRetry).toBeUndefined()
      expect(accountState.balanceLoading).toBe(false)
    })
  })
})
