import { elementUpdated, fixture } from '@open-wc/testing'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { html } from 'lit'

import { type Transaction } from '@reown/appkit-common'
import {
  AccountController,
  AssetController,
  OnRampController,
  OptionsController,
  TransactionsController
} from '@reown/appkit-core'

import { W3mOnRampActivityView } from '../../src/views/w3m-onramp-activity-view'

// --- Constants ---------------------------------------------------- //
const mockTransaction: Transaction = {
  id: 'tx-1',
  metadata: {
    status: 'ONRAMP_TRANSACTION_STATUS_SUCCESS',
    minedAt: '2024-03-14T10:00:00Z',
    operationType: 'buy',
    hash: '0x123',
    chain: 'eip155:1',
    sentFrom: '0x123',
    sentTo: '0x456',
    nonce: 1
  },
  transfers: [
    {
      fungible_info: {
        symbol: 'ETH',
        icon: { url: 'https://example.com/eth.png' }
      },
      quantity: { numeric: '1.5' },
      direction: 'in'
    }
  ]
}

describe('W3mOnRampActivityView', () => {
  beforeEach(() => {
    vi.spyOn(AccountController, 'state', 'get').mockReturnValue({
      ...AccountController.state,
      address: '0x123'
    })

    vi.spyOn(OptionsController, 'state', 'get').mockReturnValue({
      ...OptionsController.state,
      projectId: 'test-project'
    })

    vi.spyOn(OnRampController, 'state', 'get').mockReturnValue({
      ...OnRampController.state,
      selectedProvider: null
    })

    vi.spyOn(AssetController, 'state', 'get').mockReturnValue({
      ...AssetController.state,
      tokenImages: { ETH: 'https://example.com/eth-alt.png' }
    })

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    vi.spyOn(TransactionsController, 'state', 'get').mockReturnValue({
      ...TransactionsController.state,
      coinbaseTransactions: {
        [currentYear]: {
          [currentMonth]: [mockTransaction]
        }
      }
    })
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should render loading state initially', async () => {
    const fetchTransactionsSpy = vi
      .spyOn(TransactionsController, 'fetchTransactions')
      .mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 0))
      })

    const element: W3mOnRampActivityView = await fixture(
      html`<w3m-onramp-activity-view></w3m-onramp-activity-view>`
    )

    await elementUpdated(element)

    const loaders = element.shadowRoot?.querySelectorAll('wui-transaction-list-item-loader')
    expect(loaders?.length).toBe(7)

    fetchTransactionsSpy.mockRestore()
  })

  it('should render transactions when loaded', async () => {
    const fetchTransactionsSpy = vi
      .spyOn(TransactionsController, 'fetchTransactions')
      .mockResolvedValue()

    const element: W3mOnRampActivityView = await fixture(
      html`<w3m-onramp-activity-view></w3m-onramp-activity-view>`
    )

    expect(fetchTransactionsSpy).toHaveBeenCalled()
    await elementUpdated(element)

    const activityItem = element.shadowRoot?.querySelector('w3m-onramp-activity-item')
    expect(activityItem).not.toBeNull()
    expect(activityItem?.purchaseCurrency).toBe('ETH')
    expect(activityItem?.purchaseValue).toBe('1.5')
    expect(activityItem?.completed).toBe(true)
  })

  it('should handle transaction status correctly', async () => {
    const inProgressTx: Transaction = {
      ...mockTransaction,
      metadata: { ...mockTransaction.metadata, status: 'ONRAMP_TRANSACTION_STATUS_IN_PROGRESS' }
    }

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    vi.spyOn(TransactionsController, 'state', 'get').mockReturnValue({
      ...TransactionsController.state,
      coinbaseTransactions: {
        [currentYear]: {
          [currentMonth]: [inProgressTx]
        }
      }
    })

    const fetchTransactionsSpy = vi
      .spyOn(TransactionsController, 'fetchTransactions')
      .mockResolvedValue()

    const element: W3mOnRampActivityView = await fixture(
      html`<w3m-onramp-activity-view></w3m-onramp-activity-view>`
    )

    expect(fetchTransactionsSpy).toHaveBeenCalled()
    await elementUpdated(element)

    const activityItem = element.shadowRoot?.querySelector('w3m-onramp-activity-item')
    expect(activityItem?.inProgress).toBe(true)
  })

  it('should handle missing transaction data gracefully', async () => {
    const invalidTx: Transaction = {
      id: 'tx-2',
      metadata: mockTransaction.metadata,
      transfers: [
        {
          fungible_info: undefined,
          quantity: { numeric: '1.5' },
          direction: 'in'
        }
      ]
    }

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth()

    vi.spyOn(TransactionsController, 'state', 'get').mockReturnValue({
      ...TransactionsController.state,
      coinbaseTransactions: {
        [currentYear]: {
          [currentMonth]: [invalidTx]
        }
      }
    })

    const element: W3mOnRampActivityView = await fixture(
      html`<w3m-onramp-activity-view></w3m-onramp-activity-view>`
    )

    await elementUpdated(element)

    const activityItem = element.shadowRoot?.querySelector('w3m-onramp-activity-item')
    expect(activityItem).toBeNull()
  })

  it('should initialize correctly', async () => {
    const clearCursorSpy = vi.spyOn(TransactionsController, 'clearCursor')
    const fetchTransactionsSpy = vi.spyOn(TransactionsController, 'fetchTransactions')

    await fixture(html`<w3m-onramp-activity-view></w3m-onramp-activity-view>`)

    expect(clearCursorSpy).toHaveBeenCalled()
    expect(fetchTransactionsSpy).toHaveBeenCalledWith('0x123', 'coinbase')
  })
})
