import { fixture } from '@open-wc/testing'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Transaction, TransactionTransfer } from '@reown/appkit-common'
import { TransactionsController } from '@reown/appkit-controllers'

import type { W3mActivityList } from '../../src/partials/w3m-activity-list'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const TRANSACTION_LIST_ITEM_SINGLE = 'wui-transaction-list-item'
const MONTH_INDEX = 'month-indexes'
const EMPTY_ACTIVITY_STATE = 'empty-activity-state'

const TRANSFER: TransactionTransfer = {
  direction: 'out',
  quantity: {
    numeric: '1'
  }
}

const TRANSACTION: Transaction = {
  id: '1',
  metadata: {
    operationType: 'eoa',
    hash: '0x123',
    chain: `eip155:`,
    minedAt: '2020-01-01',
    sentFrom: '0x123',
    sentTo: '0x321',
    status: 'confirmed',
    nonce: 1
  },
  transfers: [TRANSFER]
}

class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

describe('W3mActivityList', () => {
  beforeAll(() => {
    global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
  })

  beforeEach(() => {
    vi.spyOn(TransactionsController, 'resetTransactions').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('it should display transaction list items if not empty', async () => {
    vi.spyOn(TransactionsController, 'state', 'get').mockReturnValue({
      ...TransactionsController.state,
      transactionsByYear: {
        2020: {
          3: [TRANSACTION],
          1: [TRANSACTION]
        }
      },
      empty: false
    })

    const activityList: W3mActivityList = await fixture(`<w3m-activity-list></w3m-activity-list>`)
    const monthIndexes = Array.from(HelpersUtil.getAllByTestId(activityList, MONTH_INDEX) || [])
    const transactionListItems = Array.from(
      HelpersUtil.querySelectAll(activityList, TRANSACTION_LIST_ITEM_SINGLE) || []
    )

    expect(monthIndexes.length).toBe(2)
    expect(transactionListItems.length).toBe(2)
    expect(HelpersUtil.getTextContent(monthIndexes[0] as HTMLElement)).toBe('April 2020')
    expect(HelpersUtil.getTextContent(monthIndexes[1] as HTMLElement)).toBe('February 2020')
  })

  it('it should show empty state', async () => {
    vi.spyOn(TransactionsController, 'state', 'get').mockReturnValue({
      ...TransactionsController.state,
      transactionsByYear: {
        2020: {
          1: [TRANSACTION]
        }
      },
      loading: false,
      empty: true
    })

    const activityList: W3mActivityList = await fixture(`<w3m-activity-list></w3m-activity-list>`)
    const emptyAccountState = HelpersUtil.getByTestId(activityList, EMPTY_ACTIVITY_STATE)

    expect(emptyAccountState).not.toBeNull()
  })
})
