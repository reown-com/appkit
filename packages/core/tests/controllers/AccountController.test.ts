import { mainnet } from 'viem/chains'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'

import {
  AccountController,
  ChainController,
  type ConnectionControllerClient,
  type NetworkControllerClient
} from '../../exports/index.js'

// -- Setup --------------------------------------------------------------------
const caipAddress = 'eip155:1:0x123'
const balance = '0.100'
const balanceSymbol = 'ETH'
const profileName = 'john.eth'
const profileImage = 'https://ipfs.com/0x123.png'
const explorerUrl = 'https://some.explorer.com/explore'
const chain = ConstantsUtil.CHAIN.EVM
const networks = [
  { ...mainnet, chainNamespace: ConstantsUtil.CHAIN.EVM, caipNetworkId: 'eip155:1' }
] as CaipNetwork[]

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
    expect(AccountController.state.preferredAccountType).toEqual('eoa')

    AccountController.setPreferredAccountType('smartAccount', chain)
    expect(AccountController.state.preferredAccountType).toEqual('smartAccount')
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
      addressLabels: new Map<string, string>()
    })
  })
})
