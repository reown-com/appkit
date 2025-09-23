import { DateUtil } from '@reown/appkit-common'
import type { Transaction, TransactionImage, TransactionTransfer } from '@reown/appkit-common'

import type { TransactionType } from './TypeUtil.js'
import { UiHelperUtil } from './UiHelperUtil.js'

// -- Helpers --------------------------------------------- //
const FLOAT_FIXED_VALUE = 3
const GAS_FEE_THRESHOLD = 0.1
const plusTypes: TransactionType[] = ['receive', 'deposit', 'borrow', 'claim']
const minusTypes: TransactionType[] = ['withdraw', 'repay', 'burn']

export const TransactionUtil = {
  getTransactionGroupTitle(year: number, month: number) {
    const currentYear = DateUtil.getYear()
    const monthName = DateUtil.getMonthNameByIndex(month)
    const isCurrentYear = year === currentYear
    const groupTitle = isCurrentYear ? monthName : `${monthName} ${year}`

    return groupTitle
  },

  getTransactionImages(transfers: TransactionTransfer[]): TransactionImage[] {
    const [transfer, secondTransfer] = transfers
    const isAllNFT = Boolean(transfer) && transfers?.every(item => Boolean(item.nft_info))
    const haveMultipleTransfers = transfers?.length > 1
    const haveTwoTransfers = transfers?.length === 2

    if (haveTwoTransfers && !isAllNFT) {
      return [this.getTransactionImage(secondTransfer), this.getTransactionImage(transfer)]
    }

    if (haveMultipleTransfers) {
      return transfers.map(item => this.getTransactionImage(item))
    }

    return [this.getTransactionImage(transfer)]
  },

  getTransactionImage(transfer?: TransactionTransfer): TransactionImage {
    return {
      type: TransactionUtil.getTransactionTransferTokenType(transfer),
      url: TransactionUtil.getTransactionImageURL(transfer)
    }
  },

  getTransactionImageURL(transfer: TransactionTransfer | undefined) {
    let imageURL = undefined
    const isNFT = Boolean(transfer?.nft_info)
    const isFungible = Boolean(transfer?.fungible_info)

    if (transfer && isNFT) {
      imageURL = transfer?.nft_info?.content?.preview?.url
    } else if (transfer && isFungible) {
      imageURL = transfer?.fungible_info?.icon?.url
    }

    return imageURL
  },

  getTransactionTransferTokenType(transfer?: TransactionTransfer): 'FUNGIBLE' | 'NFT' | undefined {
    if (transfer?.fungible_info) {
      return 'FUNGIBLE'
    } else if (transfer?.nft_info) {
      return 'NFT'
    }

    return undefined
  },

  getTransactionDescriptions(transaction: Transaction, mergedTransfers?: TransactionTransfer[]) {
    const type = transaction?.metadata?.operationType as TransactionType

    const transfers = mergedTransfers || transaction?.transfers
    const haveTransfer = transfers?.length > 0
    const haveMultipleTransfers = transfers?.length > 1
    const isFungible =
      haveTransfer && transfers?.every(transfer => Boolean(transfer?.fungible_info))
    const [firstTransfer, secondTransfer] = transfers

    let firstDescription = this.getTransferDescription(firstTransfer)
    let secondDescription = this.getTransferDescription(secondTransfer)

    if (!haveTransfer) {
      const isSendOrReceive = type === 'send' || type === 'receive'

      if (isSendOrReceive && isFungible) {
        firstDescription = UiHelperUtil.getTruncateString({
          string: transaction?.metadata.sentFrom,
          charsStart: 4,
          charsEnd: 6,
          truncate: 'middle'
        })
        secondDescription = UiHelperUtil.getTruncateString({
          string: transaction?.metadata.sentTo,
          charsStart: 4,
          charsEnd: 6,
          truncate: 'middle'
        })

        return [firstDescription, secondDescription]
      }

      return [transaction.metadata.status]
    }

    if (haveMultipleTransfers) {
      return transfers.map(item => this.getTransferDescription(item)).reverse()
    }

    let prefix = ''
    if (plusTypes.includes(type)) {
      prefix = '+'
    } else if (minusTypes.includes(type)) {
      prefix = '-'
    }

    firstDescription = prefix.concat(firstDescription)

    return [firstDescription]
  },

  getTransferDescription(transfer?: TransactionTransfer) {
    let description = ''

    if (!transfer) {
      return description
    }

    if (transfer?.nft_info) {
      description = transfer?.nft_info?.name || '-'
    } else if (transfer?.fungible_info) {
      description = this.getFungibleTransferDescription(transfer) || '-'
    }

    return description
  },

  getFungibleTransferDescription(transfer?: TransactionTransfer) {
    if (!transfer) {
      return null
    }

    const quantity = this.getQuantityFixedValue(transfer?.quantity.numeric)
    const description = [quantity, transfer?.fungible_info?.symbol].join(' ').trim()

    return description
  },
  mergeTransfers(transfers: TransactionTransfer[]) {
    if (transfers?.length <= 1) {
      return transfers
    }

    // Filter out gas fee transfers (small opposite-direction amounts of same token)
    const filteredTransfers = this.filterGasFeeTransfers(transfers)

    // Merge transfers with same token and same direction
    const mergedTransfers = filteredTransfers.reduce<TransactionTransfer[]>((acc, t) => {
      const name = t?.fungible_info?.name
      const existingTransfer = acc.find(
        ({ fungible_info, direction }) =>
          name && name === fungible_info?.name && direction === t.direction
      )
      if (existingTransfer) {
        const quantity = Number(existingTransfer.quantity.numeric) + Number(t.quantity.numeric)
        existingTransfer.quantity.numeric = quantity.toString()

        existingTransfer.value = (existingTransfer.value || 0) + (t.value || 0)
      } else {
        acc.push(t)
      }

      return acc
    }, [])

    return mergedTransfers
  },

  filterGasFeeTransfers(transfers: TransactionTransfer[]): TransactionTransfer[] {
    // Group transfers by token name
    const tokenGroups = transfers.reduce<Record<string, TransactionTransfer[]>>(
      (groups, transfer) => {
        const tokenName = transfer?.fungible_info?.name
        if (tokenName) {
          if (!groups[tokenName]) {
            groups[tokenName] = []
          }
          groups[tokenName].push(transfer)
        }

        return groups
      },
      {}
    )

    const filteredTransfers: TransactionTransfer[] = []

    Object.values(tokenGroups).forEach(tokenTransfers => {
      if (tokenTransfers.length === 1) {
        const firstTransfer = tokenTransfers[0]
        if (firstTransfer) {
          filteredTransfers.push(firstTransfer)
        }
      } else {
        // Multiple transfers for same token, check for gas fee pattern
        const inTransfers = tokenTransfers.filter(t => t.direction === 'in')
        const outTransfers = tokenTransfers.filter(t => t.direction === 'out')

        if (inTransfers.length === 1 && outTransfers.length === 1) {
          const inTransfer = inTransfers[0]
          const outTransfer = outTransfers[0]

          if (inTransfer && outTransfer) {
            const inAmount = Number(inTransfer.quantity.numeric)
            const outAmount = Number(outTransfer.quantity.numeric)

            // If one amount is less than 10% of the other, consider it gas and filter out the gas transfer
            if (outAmount < inAmount * GAS_FEE_THRESHOLD) {
              filteredTransfers.push(inTransfer)
            } else if (inAmount < outAmount * GAS_FEE_THRESHOLD) {
              filteredTransfers.push(outTransfer)
            } else {
              filteredTransfers.push(...tokenTransfers)
            }
          } else {
            filteredTransfers.push(...tokenTransfers)
          }
        } else {
          filteredTransfers.push(...tokenTransfers)
        }
      }
    })

    transfers.forEach(transfer => {
      if (!transfer?.fungible_info?.name) {
        filteredTransfers.push(transfer)
      }
    })

    return filteredTransfers
  },

  getQuantityFixedValue(value: string | undefined) {
    if (!value) {
      return null
    }

    const parsedValue = parseFloat(value)

    return parsedValue.toFixed(FLOAT_FIXED_VALUE)
  }
}
