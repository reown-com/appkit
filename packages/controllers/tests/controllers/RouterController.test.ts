import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'

import { ApiController, RouterController } from '../../exports/index.js'

// -- Constants ----------------------------------------------------------------
const MOCK_PLAN = {
  tier: 'starter',
  hasExceededUsageLimit: false,
  limits: {
    isAboveRpcLimit: false,
    isAboveMauLimit: false
  }
} as const

// -- Tests --------------------------------------------------------------------
describe('RouterController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should have valid default state', () => {
    expect(RouterController.state).toEqual({
      view: 'Connect',
      history: ['Connect'],
      transactionStack: []
    })
  })

  it('should update state correctly on push()', () => {
    RouterController.push('Account')
    expect(RouterController.state).toEqual({
      view: 'Account',
      history: ['Connect', 'Account'],
      transactionStack: []
    })
  })

  it('should not update state when push() is called with the same view', () => {
    RouterController.push('Account')
    expect(RouterController.state).toEqual({
      view: 'Account',
      history: ['Connect', 'Account'],
      transactionStack: []
    })
  })

  it('should update state correctly on goBack()', () => {
    RouterController.goBack()
    expect(RouterController.state).toEqual({
      view: 'Connect',
      history: ['Connect'],
      transactionStack: []
    })
  })

  it('should not update state when goBack() is called with only one view in history', () => {
    RouterController.goBack()
    expect(RouterController.state).toEqual({
      view: 'Connect',
      history: ['Connect'],
      transactionStack: []
    })
  })

  it('should update state correctly on reset()', () => {
    RouterController.reset('Account')
    expect(RouterController.state).toEqual({
      view: 'Account',
      history: ['Account'],
      transactionStack: []
    })
  })

  it('should update state correctly on replace()', () => {
    RouterController.push('Connect')
    RouterController.replace('Networks')
    expect(RouterController.state).toEqual({
      view: 'Networks',
      history: ['Account', 'Networks'],
      transactionStack: []
    })
  })

  it('should update state correctly on push() with data', () => {
    RouterController.push('ConnectingExternal', {
      connector: {
        id: 'test',
        name: 'wcConnector',
        type: 'WALLET_CONNECT',
        chain: ConstantsUtil.CHAIN.EVM
      }
    })
    expect(RouterController.state).toEqual({
      view: 'ConnectingExternal',
      history: ['Account', 'Networks', 'ConnectingExternal'],
      data: {
        connector: {
          id: 'test',
          type: 'WALLET_CONNECT',
          chain: ConstantsUtil.CHAIN.EVM,
          name: 'wcConnector'
        }
      },
      transactionStack: []
    })
  })

  it('should clear data wallet state when goBack() is called', () => {
    RouterController.push('Connect', {
      wallet: {
        id: 'test',
        name: 'test_wallet'
      }
    })
    RouterController.goBack()
    expect(RouterController.state).toEqual({
      view: 'ConnectingExternal',
      history: ['Account', 'Networks', 'ConnectingExternal'],
      transactionStack: [],
      data: {
        wallet: undefined
      }
    })
  })

  describe('usage limit restrictions', () => {
    beforeEach(() => {
      RouterController.reset('Connect')
    })

    describe('when hasExceededUsageLimit is true', () => {
      beforeEach(() => {
        vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
          ...ApiController.state,
          plan: { ...MOCK_PLAN, hasExceededUsageLimit: true }
        })
      })

      it('should redirect to UsageExceeded when pushing ConnectingExternal', () => {
        RouterController.push('ConnectingExternal', {
          connector: {
            id: 'test',
            name: 'testConnector',
            type: 'WALLET_CONNECT',
            chain: ConstantsUtil.CHAIN.EVM
          }
        })

        expect(RouterController.state.view).toBe('UsageExceeded')
        expect(RouterController.state.history).toEqual(['Connect', 'UsageExceeded'])
        expect(RouterController.state.data).toBeUndefined()
      })

      it('should redirect to UsageExceeded when pushing ConnectingMultiChain', () => {
        RouterController.push('ConnectingMultiChain')

        expect(RouterController.state.view).toBe('UsageExceeded')
        expect(RouterController.state.history).toEqual(['Connect', 'UsageExceeded'])
        expect(RouterController.state.data).toBeUndefined()
      })

      it('should redirect to UsageExceeded when pushing ConnectingSocial', () => {
        RouterController.push('ConnectingSocial')

        expect(RouterController.state.view).toBe('UsageExceeded')
        expect(RouterController.state.history).toEqual(['Connect', 'UsageExceeded'])
        expect(RouterController.state.data).toBeUndefined()
      })

      it('should redirect to UsageExceeded when pushing ConnectingFarcaster', () => {
        RouterController.push('ConnectingFarcaster')

        expect(RouterController.state.view).toBe('UsageExceeded')
        expect(RouterController.state.history).toEqual(['Connect', 'UsageExceeded'])
        expect(RouterController.state.data).toBeUndefined()
      })

      it('should clear data when redirecting to UsageExceeded', () => {
        RouterController.push('ConnectingExternal', {
          connector: {
            id: 'test',
            name: 'testConnector',
            type: 'WALLET_CONNECT',
            chain: ConstantsUtil.CHAIN.EVM
          },
          wallet: {
            id: 'wallet-id',
            name: 'wallet-name'
          }
        })

        expect(RouterController.state.view).toBe('UsageExceeded')
        expect(RouterController.state.data).toBeUndefined()
      })

      it('should allow navigation to non-restricted views', () => {
        RouterController.push('Account')

        expect(RouterController.state.view).toBe('Account')
        expect(RouterController.state.history).toEqual(['Connect', 'Account'])
      })

      it('should allow navigation to Networks view', () => {
        RouterController.push('Networks')

        expect(RouterController.state.view).toBe('Networks')
        expect(RouterController.state.history).toEqual(['Connect', 'Networks'])
      })

      it('should allow navigation to AllWallets view', () => {
        RouterController.push('AllWallets')

        expect(RouterController.state.view).toBe('AllWallets')
        expect(RouterController.state.history).toEqual(['Connect', 'AllWallets'])
      })

      it('should allow navigation to UsageExceeded view itself', () => {
        RouterController.push('UsageExceeded')

        expect(RouterController.state.view).toBe('UsageExceeded')
        expect(RouterController.state.history).toEqual(['Connect', 'UsageExceeded'])
      })
    })

    describe('when hasExceededUsageLimit is false', () => {
      beforeEach(() => {
        vi.spyOn(ApiController, 'state', 'get').mockReturnValue({
          ...ApiController.state,
          plan: { ...MOCK_PLAN, hasExceededUsageLimit: false }
        })
      })

      it('should allow navigation to ConnectingExternal when limit not exceeded', () => {
        RouterController.push('ConnectingExternal', {
          connector: {
            id: 'test',
            name: 'testConnector',
            type: 'WALLET_CONNECT',
            chain: ConstantsUtil.CHAIN.EVM
          }
        })

        expect(RouterController.state.view).toBe('ConnectingExternal')
        expect(RouterController.state.history).toEqual(['Connect', 'ConnectingExternal'])
        expect(RouterController.state.data).toEqual({
          connector: {
            id: 'test',
            name: 'testConnector',
            type: 'WALLET_CONNECT',
            chain: ConstantsUtil.CHAIN.EVM
          }
        })
      })

      it('should allow navigation to ConnectingMultiChain when limit not exceeded', () => {
        RouterController.push('ConnectingMultiChain')

        expect(RouterController.state.view).toBe('ConnectingMultiChain')
        expect(RouterController.state.history).toEqual(['Connect', 'ConnectingMultiChain'])
      })

      it('should allow navigation to ConnectingSocial when limit not exceeded', () => {
        RouterController.push('ConnectingSocial')

        expect(RouterController.state.view).toBe('ConnectingSocial')
        expect(RouterController.state.history).toEqual(['Connect', 'ConnectingSocial'])
      })

      it('should allow navigation to ConnectingFarcaster when limit not exceeded', () => {
        RouterController.push('ConnectingFarcaster')

        expect(RouterController.state.view).toBe('ConnectingFarcaster')
        expect(RouterController.state.history).toEqual(['Connect', 'ConnectingFarcaster'])
      })

      it('should preserve data when navigating to restricted views', () => {
        const testData = {
          connector: {
            id: 'test-connector',
            name: 'Test Connector',
            type: 'WALLET_CONNECT' as const,
            chain: ConstantsUtil.CHAIN.EVM
          }
        }

        RouterController.push('ConnectingExternal', testData)

        expect(RouterController.state.data).toEqual(testData)
      })
    })
  })
})
