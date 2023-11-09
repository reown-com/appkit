import { DateUtil, type TransactionTransfer, type Transaction } from '@web3modal/common'
import { type TransactionType } from './TypeUtil.js'
import { UiHelperUtil } from './UiHelperUtil.js'

// -- Helpers --------------------------------------------- //
const FLOAT_FIXED_VALUE = 3

export const TransactionUtil = {
  getTransactionGroupTitle(year: number) {
    const currentYear = DateUtil.getYear()
    const isCurrentYear = year === currentYear
    const groupTitle = isCurrentYear ? 'This Year' : year

    return groupTitle
  },
  getTransactionImageURL(
    transfer: TransactionTransfer | undefined,
    isNFT: boolean,
    isFungible: boolean
  ) {
    let imageURL = null

    if (transfer && isNFT) {
      imageURL = transfer?.nft_info?.content?.preview?.url
    } else if (transfer && isFungible) {
      imageURL = transfer?.fungible_info?.icon?.url
    }

    return imageURL
  },
  getTransactionDescriptions(transaction: Transaction) {
    const type = transaction.metadata?.operationType as TransactionType

    const transfers = transaction.transfers
    const haveTransfer = transaction.transfers?.length > 0
    const haveMultipleTransfers = transaction.transfers?.length > 1
    const isFungible = haveTransfer && transfers?.every(transfer => Boolean(transfer.fungible_info))
    const firstTransfer = transfers?.[0]
    const secondTransfer = transfers?.[1]

    let firstDescription = this.getTransferDescription(firstTransfer)
    let secondDescription = this.getTransferDescription(secondTransfer)

    if (!haveTransfer) {
      const isSendOrReceive = type === 'send' || type === 'receive'

      if (isSendOrReceive && isFungible) {
        firstDescription = UiHelperUtil.getTruncateString({
          string: transaction.metadata.sentFrom,
          charsStart: 4,
          charsEnd: 6,
          truncate: 'middle'
        })
        secondDescription = UiHelperUtil.getTruncateString({
          string: transaction.metadata.sentTo,
          charsStart: 4,
          charsEnd: 6,
          truncate: 'middle'
        })

        return [firstDescription, secondDescription]
      }

      return [transaction.metadata.status]
    }

    let prefix = ''
    if (type === 'receive' || type === 'deposit') {
      prefix = '+'
    }
    if (type === 'withdraw' || type === 'repay' || type === 'burn') {
      prefix = '-'
    }

    if (haveMultipleTransfers) {
      if (type === 'mint') {
        return [firstDescription]
      }

      return [firstDescription, secondDescription]
    }

    firstDescription = `${prefix}${firstDescription}`

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
  getQuantityFixedValue(value: string | undefined) {
    if (!value) {
      return null
    }

    const parsedValue = parseFloat(value)

    return parsedValue.toFixed(FLOAT_FIXED_VALUE)
  }
}
