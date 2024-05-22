/// <reference path="../../../../global.d.ts" />

import type { Transaction } from '@web3modal/common'
import { type CaipNetwork } from '@web3modal/core'

// -- Types --------------------------------------------- //
export interface ActivityControllerState {
  transactions: Transaction[]
  coinbaseTransactions: TransactionByYearMap
  transactionsByYear: TransactionByYearMap
  loading: boolean
  empty: boolean
  next: string | undefined
  projectId: string
  caipNetworkId?: CaipNetwork['id']
}

type TransactionByMonthMap = Record<number, Transaction[]>
type TransactionByYearMap = Record<number, TransactionByMonthMap>

export type ActivityController = ControllerType<ActivityControllerState> & {
  fetchTransactions: (accountAddress?: string, onramp?: 'coinbase') => Promise<void>
  groupTransactionsByYearAndMonth: (
    transactionsMap: TransactionByYearMap,
    transactions: Transaction[]
  ) => TransactionByYearMap
  filterSpamTransactions: (transactions: Transaction[]) => Transaction[]
  clearCursor: () => void
  resetTransactions: () => void
}

export type ActivityPlugin = {
  ActivityController: ActivityController
  ActivityControllerState: ActivityControllerState
  TransactionByYearMap: TransactionByYearMap
}
