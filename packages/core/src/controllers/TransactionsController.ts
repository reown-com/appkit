import type { Transaction } from '@reown/appkit-common'
import { proxy, subscribe as sub } from 'valtio/vanilla'
import { OptionsController } from './OptionsController.js'
import { EventsController } from './EventsController.js'
import { SnackController } from './SnackController.js'
import type { CaipNetworkId } from '@reown/appkit-common'
import { BlockchainApiController } from './BlockchainApiController.js'
import { AccountController } from './AccountController.js'
import {
  PEANUT_CONTRACTS,
  getContract,
  getDefaultProvider,
  getDepositIdxs,
  getTxReceiptFromHash
} from '@squirrel-labs/peanut-sdk'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet'
import { ChainController } from './ChainController.js'

// -- Types --------------------------------------------- //
type TransactionByMonthMap = Record<number, Transaction[]>
type TransactionByYearMap = Record<number, TransactionByMonthMap>

export interface TransactionsControllerState {
  transactions: Transaction[]
  coinbaseTransactions: TransactionByYearMap
  transactionsByYear: TransactionByYearMap
  lastNetworkInView: CaipNetworkId | undefined
  loading: boolean
  empty: boolean
  next: string | undefined
}

// -- State --------------------------------------------- //
const state = proxy<TransactionsControllerState>({
  transactions: [],
  coinbaseTransactions: {},
  transactionsByYear: {},
  lastNetworkInView: undefined,
  loading: false,
  empty: false,
  next: undefined
})

// -- Controller ---------------------------------------- //
export const TransactionsController = {
  state,

  subscribe(callback: (newState: TransactionsControllerState) => void) {
    return sub(state, () => callback(state))
  },

  setLastNetworkInView(lastNetworkInView: TransactionsControllerState['lastNetworkInView']) {
    state.lastNetworkInView = lastNetworkInView
  },

  async fetchTransactions(accountAddress?: string, onramp?: 'coinbase') {
    const { projectId } = OptionsController.state

    if (!projectId || !accountAddress) {
      throw new Error("Transactions can't be fetched without a projectId and an accountAddress")
    }

    state.loading = true

    try {
      let response = await BlockchainApiController.fetchTransactions({
        account: accountAddress,
        projectId,
        cursor: state.next,
        onramp,
        // Coinbase transaction history state updates require the latest data
        cache: onramp === 'coinbase' ? 'no-cache' : undefined,
        chainId: ChainController.state.activeCaipNetwork?.id
      })

      response.data = response.data.map((tx: any) => {
        const chainId = tx.metadata.chain?.split(':')[1]
        const sentTo = tx.metadata.sentTo

        if (chainId && PEANUT_CONTRACTS[chainId]) {
          const addresses = Object.values(PEANUT_CONTRACTS[chainId])
            .filter((value): value is string => typeof value === 'string')
            .map((address: string) => address.toLowerCase())

          const isAddressPresent = addresses.includes(sentTo.toLowerCase())

          if (isAddressPresent) {
            return {
              ...tx,
              metadata: { ...tx.metadata, application: { name: 'peanut_created_link' } }
            }
          }
        }
        return tx
      })

      const nonSpamTransactions = this.filterSpamTransactions(response.data)
      const sameChainTransactions = this.filterByConnectedChain(nonSpamTransactions)
      const filteredTransactions = [...state.transactions, ...sameChainTransactions]

      state.loading = false

      if (onramp === 'coinbase') {
        state.coinbaseTransactions = this.groupTransactionsByYearAndMonth(
          state.coinbaseTransactions,
          response.data
        )
      } else {
        state.transactions = filteredTransactions
        state.transactionsByYear = this.groupTransactionsByYearAndMonth(
          state.transactionsByYear,
          sameChainTransactions
        )
      }

      state.empty = filteredTransactions.length === 0
      state.next = response.next ? response.next : undefined
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'ERROR_FETCH_TRANSACTIONS',
        properties: {
          address: accountAddress,
          projectId,
          cursor: state.next,
          isSmartAccount:
            AccountController.state.preferredAccountType ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
        }
      })
      SnackController.showError('Failed to fetch transactions')
      state.loading = false
      state.empty = true
      state.next = undefined
    }
  },

  groupTransactionsByYearAndMonth(
    transactionsMap: TransactionByYearMap = {},
    transactions: Transaction[] = []
  ) {
    const grouped = transactionsMap
    transactions.forEach(transaction => {
      const year = new Date(transaction.metadata.minedAt).getFullYear()
      const month = new Date(transaction.metadata.minedAt).getMonth()

      const yearTransactions = grouped[year] ?? {}
      const monthTransactions = yearTransactions[month] ?? []

      // If there's a transaction with the same id, remove the old one
      const newMonthTransactions = monthTransactions.filter(tx => tx.id !== transaction.id)

      grouped[year] = {
        ...yearTransactions,
        [month]: [...newMonthTransactions, transaction].sort(
          (a, b) => new Date(b.metadata.minedAt).getTime() - new Date(a.metadata.minedAt).getTime()
        )
      }
    })

    return grouped
  },

  filterSpamTransactions(transactions: Transaction[]) {
    return transactions.filter(transaction => {
      const isAllSpam = transaction.transfers.every(
        transfer => transfer.nft_info?.flags.is_spam === true
      )

      return !isAllSpam
    })
  },

  filterByConnectedChain(transactions: Transaction[]) {
    const chainId = ChainController.state.activeCaipNetwork?.id
    const filteredTransactions = transactions.filter(
      transaction => transaction.metadata.chain === chainId
    )

    return filteredTransactions
  },

  clearCursor() {
    state.next = undefined
  },

  async getPeanutLinkStatus(transaction?: Transaction) {
    try {
      if (!transaction) return
      const hash = transaction.metadata.hash
      const chainId = transaction.metadata.chain?.split(':')[1] ?? ''
      const sentTo = transaction.metadata.sentTo

      let contractVersion = ''
      for (const [, chainData] of Object.entries(PEANUT_CONTRACTS)) {
        //@ts-ignore
        for (const [key, value] of Object.entries(chainData)) {
          if (typeof value === 'string' && value.toLowerCase() === sentTo) {
            contractVersion = key
            break
          }
        }
        if (contractVersion) break
      }

      if (!contractVersion) {
        console.error('Contract version not found')
        return
      }
      const provider = await getDefaultProvider(chainId)

      const txReceipt = await getTxReceiptFromHash(hash, chainId, provider)

      const depositIdx = await getDepositIdxs(txReceipt, chainId, contractVersion)

      const contract = await getContract(chainId, provider, contractVersion)
      //@ts-ignore
      const deposit = await contract.deposits(depositIdx[0])
      return deposit.claimed
    } catch (error) {
      console.log(error)
      return undefined
    }
  },

  resetTransactions() {
    state.transactions = []
    state.transactionsByYear = {}
    state.lastNetworkInView = undefined
    state.loading = false
    state.empty = false
    state.next = undefined
  }
}
