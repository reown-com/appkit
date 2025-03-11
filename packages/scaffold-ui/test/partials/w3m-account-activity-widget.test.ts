import { fixture } from '@open-wc/testing'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { Transaction, TransactionTransfer } from '@reown/appkit-common'
import { TransactionsController } from '@reown/appkit-controllers'

import type { W3mAccountActivityWidget } from '../../src/partials/w3m-account-activity-widget'
import { HelpersUtil } from '../utils/HelpersUtil'

// -- Constants -------------------------------------------- //
const TRANSACTION_LIST_ITEM_SINGLE = 'wui-transaction-list-item'
const ACTIVITY_LIST = 'w3m-activity-list'
const MONTH_INDEX = 'month-indexes'
const EMPTY_ACCOUNT_STATE = 'empty-account-state'

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

describe('W3mAccountActivityWidget', () => {
  beforeAll(() => {
    global.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver
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

    const accountActivityWidget: W3mAccountActivityWidget = await fixture(
      `<w3m-account-activity-widget></w3m-account-activity-widget>`
    )
    const activityList = HelpersUtil.querySelect(accountActivityWidget, ACTIVITY_LIST)
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

    const accountActivityWidget: W3mAccountActivityWidget = await fixture(
      `<w3m-account-activity-widget></w3m-account-activity-widget>`
    )
    const activityList = HelpersUtil.querySelect(accountActivityWidget, ACTIVITY_LIST)
    const emptyAccountState = HelpersUtil.getByTestId(activityList, EMPTY_ACCOUNT_STATE)

    expect(emptyAccountState).not.toBeNull()
  })
})
