import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-image/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { TransactionIconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'
import type { Transaction, TransactionTransfer } from '@web3modal/core'

// -- Helpers -------------------------------- //
// const nft: TransactionType[] = ['approve', 'bought', 'borrow']
// const both: TransactionType[] = [
//   'approve',
//   'bought',
//   'borrow',
//   'burn',
//   'cancel',
//   'deploy',
//   'claim',
//   'deposit',
//   'execute',
//   'mint',
//   'send',
//   'stake',
//   'trade',
//   'unstake',
//   'withdraw'
// ]

@customElement('wui-transaction-visual')
export class WuiTransactionVisual extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public transfer?: TransactionTransfer

  @property() public transaction?: Transaction

  // -- Render -------------------------------------------- //
  public override render() {
    return html` ${this.templateVisual()} ${this.templateIcon()} `
  }

  // -- Private ------------------------------------------- //
  private templateVisual() {
    if (!this.transaction) {
      return null
    }

    const isNFT = this.transaction.transfers.every(transfer => !!transfer.nft_info)
    const isFT = this.transaction.transfers.every(transfer => !!transfer.fungible_info)

    let imageURL = null
    if (this.transfer && isNFT) {
      imageURL = this.transfer?.nft_info?.content?.preview?.url
    } else if (this.transfer && isFT) {
      imageURL = this.transfer?.fungible_info?.icon?.url
    }

    if (imageURL) {
      return html`<wui-image src=${imageURL} alt="Transaction image"></wui-image>`
    } else if (isNFT) {
      return html`<wui-icon size="inherit" color="fg-200" name="nftPlaceholder"></wui-icon>`
    }

    return html`<wui-icon size="inherit" color="fg-200" name="coinPlaceholder"></wui-icon>`
  }

  private templateIcon() {
    if (!this.transfer || !this.transaction) {
      return null
    }

    const type = this.transaction?.metadata.operationType
    const status = this.transaction?.metadata.status

    let color: 'accent-100' | 'error-100' | 'success-100' | 'inverse-100' = 'accent-100'
    let icon: TransactionIconType | null = null

    if (type === 'trade') {
      icon = 'swapHorizontal'
    } else if (this.transfer.direction) {
      switch (this.transfer.direction) {
        case 'in':
          icon = 'arrowBottom'
          break
        case 'out':
          icon = 'arrowTop'
          break
        default:
          break
      }
    }

    if (status) {
      switch (status) {
        case 'confirmed':
          color = 'success-100'
          break
        case 'failed':
          color = 'error-100'
          break
        case 'pending':
          color = 'inverse-100'
          break
        default:
          break
      }
    }

    if (!icon) {
      return null
    }

    return html`
      <wui-icon-box
        size="xs"
        iconColor=${color}
        backgroundColor=${color}
        background="opaque"
        icon=${icon}
        ?border=${true}
        borderColor="wui-color-bg-125"
      ></wui-icon-box>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-transaction-visual': WuiTransactionVisual
  }
}
