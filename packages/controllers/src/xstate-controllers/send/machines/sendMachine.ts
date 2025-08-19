import { assign, setup } from 'xstate'

import type { Balance } from '@reown/appkit-common'

import { AccountController } from '../../../controllers/AccountController.js'
import { ChainController } from '../../../controllers/ChainController.js'
import { CoreHelperUtil } from '../../../utils/CoreHelperUtil.js'
import * as sendActions from '../actions/sendActions.js'
import * as sendGuards from '../guards/sendGuards.js'
import {
  balanceFetchService,
  networkPriceFetchService,
  retryDelayService
} from '../services/balanceServices.js'
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
    balanceFetcher: balanceFetchService,
    networkPriceFetcher: networkPriceFetchService,
    ensResolver: ensResolutionService,
    transactionSender: transactionService,
    retryDelay: retryDelayService
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
      }
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
    assignTokenBalances: assign({
      tokenBalances: ({ event }) => {
        if (event.type !== 'xstate.done.actor.balanceFetcher') {
          return []
        }

        return event.output || []
      }
    }),
    assignNetworkBalance: assign({
      networkBalanceInUSD: ({ event }) => {
        if (event.type !== 'xstate.done.actor.networkPriceFetcher') {
          return undefined
        }

        return event.output
      }
    }),
    assignBalanceError: assign({
      error: ({ event }) => {
        if (event.type !== 'xstate.error.actor.balanceFetcher') {
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
    assignValidationError: assign({
      validationErrors: ({ context, event }) => {
        if (event.type !== 'VALIDATION_ERROR') {
          return context.validationErrors
        }

        return {
          ...context.validationErrors,
          [event.field]: event.message
        }
      }
    }),
    clearValidationErrors: assign({
      validationErrors: {}
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
      validationErrors: {},
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
    resetRetryCount: assign({
      retryCount: 0
    }),

    // Side effects (these can remain as external functions since they don't modify context)
    showSuccessMessage: sendActions.showSuccessMessage,
    showErrorMessage: sendActions.showErrorMessage,
    navigateToAccount: sendActions.navigateToAccount,
    navigateToTokenSelect: sendActions.navigateToTokenSelect,
    navigateToPreview: sendActions.navigateToPreview,
    navigateBack: sendActions.navigateBack
  },
  guards: {
    hasSelectedToken: sendGuards.hasSelectedToken,
    isValidToken: sendGuards.isValidToken,
    hasAmount: sendGuards.hasAmount,
    isValidAmount: sendGuards.isValidAmount,
    hasSufficientBalance: sendGuards.hasSufficientBalance,
    hasReceiverAddress: sendGuards.hasReceiverAddress,
    isValidAddress: sendGuards.isValidAddress,
    isENSName: sendGuards.isENSName,
    isFormComplete: sendGuards.isFormComplete,
    canSendTransaction: sendGuards.canSendTransaction,
    isEvmChain: sendGuards.isEvmChain,
    isSolanaChain: sendGuards.isSolanaChain,
    isNativeToken: sendGuards.isNativeToken,
    isERC20Token: sendGuards.isERC20Token,
    canRetry: sendGuards.canRetry,
    shouldAllowRetry: sendGuards.shouldAllowRetry,
    isNotLoading: sendGuards.isNotLoading,
    hasNoErrors: sendGuards.hasNoErrors,
    hasValidationErrors: sendGuards.hasValidationErrors,
    hasValidValue: sendGuards.hasValidValue
  }
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAOwgYgEoFEBiuAygBID6AQgIIAylAcgMI6EDaADALqKgAOA9rACWAF0F9U3EAA9EAVgDsAGhABPRAEZ58gHQBOWQGZ1AJjYA2XWePHZ6gCwBfB8pToMDek2qlCOOgBF2LiQQfiFRcUkZBAVlNQQDNgAObVMjUwsrG3snFzRMIhwAFVIANRoASX9KIoqAeTpSHCwsOqxWTkkwkTEJEOj1XV07PXk2MfTZOI1jXJBXCG1BCAAbMAxfahwGEqK6gGk-IK6BHsj+xGN5WVltNkHDEynVDWSRpNldAzHM61s5hZLVbrPDFBhkKi0RjMY4hboRPqgaJXG53B6TaYIeS6YzaAx2MZfXTqNi2Ni6AH5IFrDAAcTqpD2jIOfh8OC2O1hvFOCKiiAM3wM2jslnJ32e8TMBl0eKJZiSxNJJIpznmVJWfAAhhBBKgoORNStNagAMZwDAQcRgJaoABufAA1taAEaG41mvBgYQmgAWYAATlzQjzenyEDZjOptLIkmknpjjLoUhMTOZLH8cqrARrtbr9W7TeaA-6+P7tDwjcIAGalgC22ldRsLnu9fsDnThIfOSMQZiULwSbDYuMjiXUZlkiZuSUcWfVWp1eoNTbNsAwxdL5crNf99cb7rALd9AZY6mC3PCoYu4eut3u+gxA4sKQV0vlirJKry6AbBbNWC9f0VH8MAjRUC0rRte0nW0f1AOA0DNRUIN4SvHssX7eIpxGeR1DHCcpxjWdv0WKsvV9PM6C9AB3UsHQABX9QQzQg1BrV1aDrTY4RaP9BimI9ci2xQrtEWkRA7BjTE7AnYVHgydNsmItUfzI1tKJoujGOY9YNzLCtNWrOttG43j+J0o9hI7C8zjE6JJKSTFpz0cxjEk35skpVS6xwVBhCA7RIB6PUNmKUhKAAWTqABVOgihEy9u3EhJ1CSIVyXkCcrAlS5BhlCx5GldRJ30IivNIny-ICoLRBC3wSkofx-CIDpz2DRK7P5VL0t0TLZGyhNbHS8kFWKwiZ3K7Qd1rXz-JUQKdVqqBQoapqWtPNrUKS6IjDSu5eqymwE0TMxtGKpUCNKia5283dZuqxa83cLZKCwcK1uYVqTg6sMTpHLR8XFBM7FMaMBQMRNhyu5TAWm+75pqp7Nm2XYWToBLbN+3qo2nT4gYHYwIZGZJhzYOwoenGGqThqr5rg2A+BWW08z8QhWPYu1HWtNBYAAhmmZPaz2sx69vj7FzCbsfGsNkNghUMAVIfGqnbpm2nYLgRnmb1Vn139Et9O3Yyeb5rXBc20Swwh3Q2G0Mw8OMJJ4wJ6VcTMOWzDsMbocmmm5u0W1DWWQynox3lrxRO90Wd+JLFOgw8Z+RT-huiq7vVwOVmDpaMA276RfQgwknGaN5BB1LrgTUkUmsZIlZ91ONe1FQij4Qh8lCgJGSwehCEoHZ6nRoWts6hIbGFaWNAVW4+wrtMshTkim4gFu247+rwqi2L4uHy3RckifK4HexI2FHFusGBf1EmuDm9b9u3A3xrms+sO0OS-Fbilo-4gdu9pWrpfDMN8wB3zXo-MKz91pnnzuHQuCdD45QQMVTQehJKJCdsna+jdb4r3vh3BgL03pQNfrvH6osEHfyQSYR20YPhfCMFgkBYCH6YGRjsZkhwh4W3IYXYqiCEzyGMKdGwSZiQlUpswvB4CCjMDCngNoEU37bS6l-SeCAJxCj7JYNKQDPKNwWHmcscEeCaiYnqIo-pjSwE1CaBEucyEF2StiIUAMqHHRFKkZUAo9GyEmoYvUxiwCmPMVASx1jbH2Lzp2XhzivjaDceowYEM7a4SSEnK+-j8hGJ4CYsxeZwmoBsXY3oudjA8KcQMBUp1Ek-0uASW2YwLoSJjGYLJ6AjEBKgDgW0tZ2ZQS5oFXphTikIlYebWB78Bjkx0Doup4ZUpRnUPYBQNtxptIMdkwJXSel9L0luQy00hm1hGZE3o4z2wVLgclVKlgEmFXcS7LQqQCRFRaUkdpi4oDaC6YQRmxpNT9I4oM-mALTklPEBc5Ro97AlzmUgtIribimHJsrT5nStlQD+U2QF+yDJGV3D8-5qBNTgrGfkCZMTKlTzubUhFjtXHDGEZdack09LYGKFgAAmmyAI0KwyGBlIkGS6TqFmHtqkueHlF4qUWOy3ARRuW8sCDAql1zkRl3ykMSMoqEwQ1tsOaUshUUNyXvKuRJQFFYCUY49VlwBSnWHA89R2IdDkysO5Jhjd2VPy3nFflEcQZaIhk7I6LtkgJL7GME1kjvX61LCtd6L9CBfTVVM+phM7YhpjvUlJmgjUxrKnGg2oUOSoy4QG9CblM1Skdjm8MNxbgxlJoW66qpUB8AgHASQCxJkqIQLoTENs5LpBFEMcdHzG7LDWH20ebk7kxjjGG+IZdbYzkJEVJU5JJo5i+cuA88A039sSDiO4ZcdXzKEUKaUG6PzLOwUvfchYAJzRAmBWdYYQY6CXQipM36hHEkJlYBUsxG5qQonqKiPEtICTAB+68sQBySSjDiHRjCr4qzTmrOa8Gq3EhGFcZ18zBhjASaYWMazTWyqmpVf2iM9S4Y-kOL+59dUE0nChpIntjUUyLUvP2AV6ZaxZnQQgjGdqvISeMOW9abDDmFFxySrbMM0fTv7TO2c8ziYkvcW2Xt7j9WXZcH4dxGHJAULLPCUjV6sO0zETCGhyYGo4yKmS0p0nooY0e0ek545k3lMRzKQpy7pPnsAzZHTAm5OCfkixViilnKSiPAVZc8T+bY7-YYttjUBbC-opeXSfmYt2XZkkyy9ABfpfYYU7sGG+M89835xLNSlfuChyrmJbmzIvXlmVgJCuwAAK4mlXIemydrkF9lxNiDrBNxjBfxKNd5GyzXxv9HZyM4tIx2BnOo6tUYCRjGxLxttDggA */
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
    error: undefined,
    validationErrors: {}
  },

  states: {
    idle: {
      entry: ['clearValidationErrors', 'resetRetryCount', 'clearLoading'],
      on: {
        SELECT_TOKEN: {
          actions: ['assignToken'],
          target: 'formEntry'
        },
        FETCH_BALANCES: {
          target: 'loadingBalances'
        },
        GO_TO_TOKEN_SELECT: {
          actions: ['navigateToTokenSelect']
        }
      }
    },

    loadingBalances: {
      entry: ['setLoading'],
      invoke: {
        src: 'balanceFetcher',
        id: 'balanceFetcher',
        input: (): BalanceFetchInput => {
          const address = AccountController.state.address || ''
          const chainId = String(ChainController.state.activeCaipNetwork?.id || '')
          const chainNamespace = ChainController.state.activeChain || 'eip155'

          return { address, chainId, chainNamespace }
        },
        onDone: {
          actions: ['assignTokenBalances'],
          target: 'fetchingNetworkPrice'
        },
        onError: [
          {
            guard: 'shouldAllowRetry',
            actions: ['assignBalanceError'],
            target: 'balanceRetryDelay'
          },
          {
            actions: ['assignBalanceError'],
            target: 'idle'
          }
        ]
      }
    },

    balanceRetryDelay: {
      invoke: {
        src: 'retryDelay',
        id: 'retryDelay',
        input: { delayMs: 2000 },
        onDone: {
          target: 'loadingBalances'
        }
      }
    },

    fetchingNetworkPrice: {
      invoke: {
        src: 'networkPriceFetcher',
        id: 'networkPriceFetcher',
        input: ({ context }) => ({ tokenBalances: context.tokenBalances }),
        onDone: {
          actions: ['assignNetworkBalance'],
          target: 'idle'
        },
        onError: {
          // Don't fail if network price fetch fails
          target: 'idle'
        }
      }
    },

    formEntry: {
      initial: 'editing',
      states: {
        editing: {
          on: {
            SET_AMOUNT: {
              actions: ['assignAmount'],
              target: 'validating'
            },
            SET_ADDRESS: [
              {
                guard: 'isENSName',
                actions: ['assignAddress'],
                target: 'resolvingENS'
              },
              {
                actions: ['assignAddress'],
                target: 'validating'
              }
            ],
            CLEAR_ADDRESS: {
              actions: ['clearAddressDetails'],
              target: 'editing'
            },
            SELECT_TOKEN: {
              actions: ['assignToken'],
              target: 'editing'
            }
          }
        },

        resolvingENS: {
          entry: ['setLoading'],
          invoke: {
            src: 'ensResolver',
            id: 'ensResolver',
            input: ({ context }) => ({
              nameOrAddress: context.receiverAddress || '',
              chainNamespace: ChainController.state.activeChain
            }),
            onDone: {
              actions: ['assignENSResolution', 'clearLoading'],
              target: 'validating'
            },
            onError: {
              actions: [
                'clearLoading',
                assign({
                  validationErrors: ({ context }) => ({
                    ...context.validationErrors,
                    address: 'Invalid ENS name or address'
                  })
                })
              ],
              target: 'editing'
            }
          }
        },

        validating: {
          always: [
            {
              guard: 'canSendTransaction',
              target: '#send.readyToSend'
            },
            {
              actions: [
                // Set validation errors based on current state
                assign({
                  validationErrors: ({ context }) => {
                    const errors: SendContext['validationErrors'] = {}

                    if (!context.selectedToken) {
                      errors.token = 'Please select a token'
                    }

                    if (!context.sendAmount) {
                      errors.amount = 'Please enter an amount'
                    } else if (context.sendAmount <= 0) {
                      errors.amount = 'Amount must be greater than 0'
                    } else if (
                      context.selectedToken &&
                      context.sendAmount > Number(context.selectedToken.quantity.numeric)
                    ) {
                      errors.amount = 'Insufficient balance'
                    }

                    if (!context.receiverAddress) {
                      /* Empty */
                    } else if (
                      !CoreHelperUtil.isAddress(
                        context.receiverAddress,
                        ChainController.state.activeChain
                      )
                    ) {
                      errors.address = 'Invalid address format'
                    }

                    return errors
                  }
                })
              ],
              target: 'editing'
            }
          ]
        }
      }
    },

    readyToSend: {
      entry: ['clearValidationErrors', 'clearLoading'],
      on: {
        SEND_TRANSACTION: {
          target: 'sending'
        },
        SET_AMOUNT: {
          actions: ['assignAmount'],
          target: 'formEntry.validating'
        },
        SET_ADDRESS: [
          {
            guard: 'isENSName',
            actions: ['assignAddress'],
            target: 'formEntry.resolvingENS'
          },
          {
            actions: ['assignAddress'],
            target: 'formEntry.validating'
          }
        ],
        CLEAR_ADDRESS: {
          actions: ['clearAddressDetails'],
          target: 'formEntry.editing'
        },
        SELECT_TOKEN: {
          actions: ['assignToken'],
          target: 'formEntry.validating'
        },
        RESET_FORM: {
          actions: ['resetForm'],
          target: 'idle'
        }
      }
    },

    sending: {
      initial: 'preparingTransaction',
      entry: ['setLoading'],
      states: {
        preparingTransaction: {
          always: [
            {
              guard: 'isEvmChain',
              target: 'sendingEvm'
            },
            {
              guard: 'isSolanaChain',
              target: 'sendingSolana'
            },
            {
              target: '#send.error',
              actions: [
                assign({
                  error: 'Unsupported blockchain network'
                })
              ]
            }
          ]
        },

        sendingEvm: {
          invoke: {
            src: 'transactionSender',
            id: 'evmTransactionSender',
            input: ({ context }) => ({
              type: 'evm' as const,
              token: context.selectedToken,
              amount: context.sendAmount || 0,
              to: context.receiverAddress || '',
              fromAddress: AccountController.state.address || '',
              chainNamespace: ChainController.state.activeChain || 'eip155'
            }),
            onDone: {
              actions: ['assignTransactionSuccess', 'showSuccessMessage', 'navigateToAccount'],
              target: 'success'
            },
            onError: {
              actions: ['assignTransactionError'],
              target: '#send.error'
            }
          }
        },

        sendingSolana: {
          invoke: {
            src: 'transactionSender',
            id: 'solanaTransactionSender',
            input: ({ context }) => ({
              type: 'solana' as const,
              amount: context.sendAmount || 0,
              to: context.receiverAddress || '',
              fromAddress: AccountController.state.address || '',
              chainNamespace: 'solana'
            }),
            onDone: {
              actions: ['assignTransactionSuccess', 'showSuccessMessage', 'navigateToAccount'],
              target: 'success'
            },
            onError: {
              actions: ['assignTransactionError'],
              target: '#send.error'
            }
          }
        },

        success: {
          type: 'final',
          entry: ['resetForm']
        }
      }
    },

    error: {
      entry: ['clearLoading', 'showErrorMessage'],
      on: {
        RETRY_SEND: [
          {
            guard: 'canRetry',
            target: 'sending'
          },
          {
            actions: [
              assign({
                error: 'Maximum retry attempts exceeded'
              })
            ]
          }
        ],
        RESET_FORM: {
          actions: ['resetForm'],
          target: 'idle'
        },
        SET_AMOUNT: {
          actions: ['assignAmount', 'clearValidationErrors'],
          target: 'formEntry.validating'
        },
        SET_ADDRESS: {
          actions: ['assignAddress', 'clearValidationErrors'],
          target: 'formEntry.validating'
        },
        SELECT_TOKEN: {
          actions: ['assignToken', 'clearValidationErrors'],
          target: 'formEntry.validating'
        }
      }
    }
  },

  // Global event handlers
  on: {
    REFRESH_BALANCES: {
      target: '.loadingBalances'
    },
    CANCEL_SEND: {
      actions: ['resetForm'],
      target: '.idle'
    },
    RESET_VALIDATION_ERRORS: {
      actions: ['clearValidationErrors']
    }
  }
})
