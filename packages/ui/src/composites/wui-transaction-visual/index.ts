import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-image/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import { type TransactionDirection, type TransactionStatus } from '@web3modal/common'
import { type TransactionIconType, type TransactionType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-transaction-visual')
export class WuiTransactionVisual extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type?: TransactionType

  @property() public status?: TransactionStatus

  @property() public direction?: TransactionDirection

  @property({ type: Boolean }) public isNFT?: boolean

  @property() public imageURL?: string

  @property() public secondImageURL?: string

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `--local-border-radius: ${
      this.isNFT ? 'var(--wui-border-radius-xxs)' : 'var(--wui-border-radius-s)'
    };`

    return html`<wui-flex> ${this.templateVisual()} ${this.templateIcon()} </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private templateVisual() {
    const isTrade = this.type === 'trade'
    const haveAnyImage = this.imageURL || this.secondImageURL

    if (isTrade && haveAnyImage) {
      return html`<div class="swap-images-container ${this.isNFT ? 'nft' : ''}">
        ${this.imageURL
          ? html`<wui-image src=${this.imageURL} alt="Transaction image"></wui-image>`
          : null}
        ${this.secondImageURL
          ? html`<wui-image src=${this.secondImageURL} alt="Transaction image"></wui-image>`
          : null}
      </div>`
    } else if (this.imageURL) {
      return html`<wui-image
        src=${this.imageURL}
        class="${this.isNFT ? 'nft' : ''}"
        alt="Transaction image"
      ></wui-image>`
    } else if (this.isNFT) {
      return html`<wui-icon size="inherit" color="fg-200" name="nftPlaceholder"></wui-icon>`
    }

    return html`<wui-icon size="inherit" color="fg-200" name="coinPlaceholder"></wui-icon>`
  }

  private templateIcon() {
    let color: 'accent-100' | 'error-100' | 'success-100' | 'inverse-100' = 'accent-100'
    let icon: TransactionIconType | undefined

    if (this.type === 'trade') {
      icon = 'swapHorizontalBold'
    } else if (this.type === 'approve') {
      icon = 'checkmark'
    } else if (this.type === 'cancel') {
      icon = 'close'
    } else if (this.type === 'burn' || this.type === 'execute' || this.type === 'deploy') {
      icon = undefined
    } else if (this.direction) {
      switch (this.direction) {
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

    if (this.status) {
      switch (this.status) {
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
        size="xxs"
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
