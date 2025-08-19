import { assign, setup } from 'xstate'

import type { Balance } from '@reown/appkit-common'

import { AccountController } from '../../../controllers/AccountController.js'
import { ChainController } from '../../../controllers/ChainController.js'
import { CoreHelperUtil } from '../../../utils/CoreHelperUtil.js'
import * as sendActions from '../actions/sendActions.js'
import { balanceAndPriceFetchService } from '../services/balanceServices.js'
import { ensResolutionService } from '../services/ensServices.js'
import { transactionService } from '../services/transactionServices.js'
import type { BalanceFetchInput, SendContext, SendEvent } from '../types/sendTypes.js'

export const sendMachine = setup({
  types: {
    context: {} as SendContext,
    events: {} as SendEvent,
    input: {} as { initialToken?: Balance }
  },
  actors: {
    balanceAndPriceFetcher: balanceAndPriceFetchService,
    ensResolver: ensResolutionService,
    transactionSender: transactionService
  },
  actions: {
    assignToken: assign({
      selectedToken: ({ event }) => {
        if (event.type !== 'SELECT_TOKEN') {
          return undefined
        }

        return event.token
      }
    }),
    assignAmount: assign({
      sendAmount: ({ event }) => {
        if (event.type !== 'SET_AMOUNT') {
          return undefined
        }

        return event.amount
      }
    }),
    assignAddress: assign({
      receiverAddress: ({ event }) => {
        if (event.type !== 'SET_ADDRESS') {
          return undefined
        }

        return event.address
      },

      receiverProfileName: undefined,
      receiverProfileImageUrl: undefined
    }),
    assignENSResolution: assign({
      receiverAddress: ({ event }) => {
        if (event.type !== 'xstate.done.actor.ensResolver') {
          return ''
        }

        return event.output?.resolvedAddress || ''
      },
      receiverProfileName: ({ event }) => {
        if (event.type !== 'xstate.done.actor.ensResolver') {
          return undefined
        }

        return event.output?.name
      },
      receiverProfileImageUrl: ({ event }) => {
        if (event.type !== 'xstate.done.actor.ensResolver') {
          return undefined
        }

        return event.output?.avatar
      }
    }),
    assignBalancesAndPrice: assign({
      tokenBalances: ({ event }) => {
        if (event.type !== 'xstate.done.actor.balanceAndPriceFetcher') {
          return []
        }

        return event.output?.balances || []
      },
      networkBalanceInUSD: ({ event }) => {
        if (event.type !== 'xstate.done.actor.balanceAndPriceFetcher') {
          return undefined
        }

        return event.output?.networkBalanceInUSD
      }
    }),
    assignBalanceError: assign({
      error: ({ event }) => {
        if (event.type !== 'xstate.error.actor.balanceAndPriceFetcher') {
          return 'Unknown error'
        }

        return event.error?.message || 'Failed to fetch balances'
      },
      loading: false,
      lastRetry: Date.now(),
      retryCount: ({ context }) => context.retryCount + 1
    }),
    assignTransactionSuccess: assign({
      loading: false,
      error: undefined
    }),
    assignTransactionError: assign({
      error: ({ event }) => {
        if (
          event.type !== 'xstate.error.actor.evmTransactionSender' &&
          event.type !== 'xstate.error.actor.solanaTransactionSender'
        ) {
          return 'Transaction failed'
        }

        return event.error?.message || 'Transaction failed'
      },
      loading: false
    }),

    clearAddressDetails: assign({
      receiverAddress: undefined,
      receiverProfileName: undefined,
      receiverProfileImageUrl: undefined
    }),
    resetForm: assign({
      selectedToken: undefined,
      sendAmount: undefined,
      receiverAddress: undefined,
      receiverProfileName: undefined,
      receiverProfileImageUrl: undefined,
      error: undefined,
      loading: false,
      retryCount: 0
    }),

    setLoading: assign({
      loading: true
    }),
    clearLoading: assign({
      loading: false
    }),
    incrementRetryCount: assign({
      retryCount: ({ context }) => context.retryCount + 1
    }),

    showSuccessMessage: sendActions.showSuccessMessage,
    showErrorMessage: sendActions.showErrorMessage,
    navigateToAccount: sendActions.navigateToAccount,
    navigateToTokenSelect: sendActions.navigateToTokenSelect,
    navigateToPreview: sendActions.navigateToPreview,
    navigateBack: sendActions.navigateBack
  },
  guards: {
    isENSName: ({ event }) => {
      if (event.type !== 'SET_ADDRESS') {
        return false
      }

      return event.address.includes('.')
    },

    isValidAddress: ({ event }) => {
      if (event.type !== 'SET_ADDRESS') {
        return false
      }

      const activeChain = ChainController.state.activeChain

      return CoreHelperUtil.isAddress(event.address, activeChain)
    },

    canSendTransaction: ({ context }) =>
      Boolean(
        context.selectedToken &&
          context.sendAmount &&
          context.sendAmount > 0 &&
          context.receiverAddress &&
          context.sendAmount <= Number(context.selectedToken.quantity.numeric)
      )
  }
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAOwgOgJYQDZgGIAxAUQBUBhACQH0AhAQQBkGA5CkgZQG0AGAXUSgADgHtYWAC5ZRqISAAeiAIwBOAOyqMADnXblygMwAWAKyrjy3oYA0IAJ6JDvAEwYAbNuPH3p99cN1ZVMAXxC7FHQMAEMAY2kAN0IIWTBsVATRAGs0gCNo3GjUWLAGdAAFACcsEqIwSViACzBKvkEkEDEJaVl5JQRTEwxVd2NtdxcXbRdjFztHBBNTD0Mp0x9zNeMwiLRMOMTCFsrRSoxhQskAM1OAWwx8wuLSiura+qaWtvkuqRk5Dr9QbLdyraZqXhGMa2ByISbLSa+YLKbQjZwTHYgSL7eJYJIETgkJgkChkGhkADyAGkSKxvh1fj0AaB+rplsZ1O5-OpDBo1Lp5ohNhhTMEJqprFZ3OpQuEsXtzpUwMJotVUFACeQaAwALIUgCqrDI9JE4j+vUBKhcemGykshm0zgMmhhCyMRgwvHW418LlM-uCmOxiuVqqw6s1ZIYABFowAlLg8AQ-M1MvqINkYDlc3g8vmqAWwhAF9RZ1ZmQyViwzFxBhXCJUqtUawlR2MJzg8ZTtU3df7phAGVTKT3acyeLneCyCwcuZTuDyQ9SuUF6bTjOtRBuh5sECjEhhx7XtxMmzqp-uW2ejT25sfOwLaGcGFy8DB2scOmWuP2GTeYbcm3DFsiRJMlKRpOlkwZC8LRZK0eQwKYJX0dQZVUQxRmfVxDA8VRBnUMYJj8SZ-xDICI0JVho3JOM2E4BhSQASQpKCe3PPs4MUFRTGtDBv14CUHSHDln2MVQtB8Kx-XHUxIVUMilVgURcASYDaU4AgUlQNJw0yHIMDQWA4zgFSklaaDe3NZluIQTNs25XkghLZ8DDfR1dC5CZMKmRTTNU9TWE045TnOS4bkqe4jJM5TVK+SyOOsgd7M5Rz80LN0XEMEcZjGXLVl4MY-NitT1Q0yNj3jU8EsZS94IQUERynVYuX9At9Gwqx+PXXx3GHfDVllXYomxYCtNSdJ9LSSRKiKWADn+Tg9ni9jaq4-p52lT0svWQI+onUxn3WLQRisMZgg2UEyNGiMQrOC5omuO4MBmuaFtkJb0BWlNOJsjbpUkwJzsKkwpWfQItC9cSNDXXhwWugBXWISlgWBiHIah6GYNgOCTVbYL+uEJn4yV8N4tDBKfItxNwsn9BMVYXBzbY5WDWAkZRtHCWJUlyWpWkzzWwmECZtxl2ysnrWXAtwYLYYZmcVwRlBUYwjlVBRAgOB5GxH6kqvABadxwdLdQmbktD2uCP0yJwfA9bTK81GMN8eTMFELF5QbnxmEdxcrcxPOMP9WYVBakgdurbJ8Yws1S6w-Qw3hrGN6mgk9XlneUZCXcDUOt0bMN1Uj9arQ0JCRlRNEZSmYwxLtEU4esQqjDnIr88wJSzMCzgS+FvwFymIwuWXZQ9F5Vzs6Qyxpib5y-GuvZgL7gdnddpYPeDjC-SOyskN8T8-DH0YQ+GzB2eRuB4Bg36B1mE3Tbk-RHQDaY1ZCIA */
  id: 'send',
  initial: 'idle',
  context: {
    selectedToken: undefined,
    sendAmount: undefined,
    receiverAddress: undefined,
    receiverProfileName: undefined,
    receiverProfileImageUrl: undefined,
    tokenBalances: [],
    networkBalanceInUSD: undefined,
    chainNamespace: undefined,
    loading: false,
    lastRetry: undefined,
    retryCount: 0,
    error: undefined
  },

  states: {
    idle: {
      entry: ['clearLoading'],
      on: {
        FETCH_BALANCES: { target: 'active' }
      }
    },

    active: {
      entry: ['setLoading'],
      invoke: {
        src: 'balanceAndPriceFetcher',
        id: 'balanceAndPriceFetcher',
        input: (): BalanceFetchInput => {
          const address = AccountController.state.address || ''
          const chainId = String(ChainController.state.activeCaipNetwork?.id || '')
          const chainNamespace = ChainController.state.activeChain || 'eip155'

          return { address, chainId, chainNamespace }
        },
        onDone: {
          actions: ['assignBalancesAndPrice', 'clearLoading']
        },
        onError: {
          actions: ['assignBalanceError', 'clearLoading']
        }
      },
      on: {
        SELECT_TOKEN: { actions: ['assignToken'], target: 'preparing' }
      }
    },

    preparing: {
      on: {
        SET_AMOUNT: { actions: ['assignAmount'] },
        SET_ADDRESS: [
          {
            guard: 'isENSName',
            target: 'resolvingENS',
            actions: ['assignAddress', 'setLoading']
          },
          {
            guard: 'isValidAddress',
            actions: ['assignAddress']
          }
        ],
        CLEAR_ADDRESS: { actions: ['clearAddressDetails'] },
        SELECT_TOKEN: { actions: ['assignToken'] },
        SEND_TRANSACTION: {
          target: 'sending',
          guard: 'canSendTransaction'
        }
      }
    },

    resolvingENS: {
      invoke: {
        src: 'ensResolver',
        id: 'ensResolver',
        input: ({ context }) => ({
          nameOrAddress: context.receiverAddress || '',
          chainNamespace: ChainController.state.activeChain
        }),
        onDone: {
          actions: ['assignENSResolution', 'clearLoading'],
          target: 'preparing'
        },
        onError: {
          actions: ['clearLoading', 'clearAddressDetails'],
          target: 'preparing'
        }
      },
      on: {
        SET_ADDRESS: { actions: ['assignAddress'] }
      }
    },

    sending: {
      entry: ['setLoading'],
      invoke: {
        src: 'transactionSender',
        id: 'transactionSender',
        input: ({ context }) => {
          const activeChain = ChainController.state.activeChain
          if (activeChain === 'eip155') {
            return {
              type: 'evm' as const,
              token: context.selectedToken,
              amount: context.sendAmount || 0,
              to: context.receiverAddress || '',
              fromAddress: AccountController.state.address || '',
              chainNamespace: 'eip155'
            }
          } else if (activeChain === 'solana') {
            return {
              type: 'solana' as const,
              amount: context.sendAmount || 0,
              to: context.receiverAddress || '',
              fromAddress: AccountController.state.address || '',
              chainNamespace: 'solana'
            }
          }
          throw new Error('Unsupported blockchain network')
        },
        onDone: {
          actions: ['assignTransactionSuccess', 'showSuccessMessage', 'navigateToAccount'],
          target: 'success'
        },
        onError: {
          actions: ['assignTransactionError', 'clearLoading'],
          target: 'preparing'
        }
      }
    },

    success: {
      entry: ['clearLoading', 'resetForm'],
      on: {
        FETCH_BALANCES: { target: 'active' },
        SELECT_TOKEN: { actions: ['assignToken'], target: 'preparing' }
      }
    }
  }
})
