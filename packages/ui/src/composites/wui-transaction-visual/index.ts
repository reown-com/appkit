import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import type { TransactionDirection, TransactionImage, TransactionStatus } from '@web3modal/common'
import type { TransactionIconType, TransactionType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../../components/wui-image/index.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-transaction-visual')
export class WuiTransactionVisual extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() public type?: TransactionType

  @property() public status?: TransactionStatus

  @property() public direction?: TransactionDirection

  @property() public images: TransactionImage[] = []

  @property() public secondImage: TransactionImage = {
    type: undefined,
    url: ''
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const firstImage = this.images[0]
    const secondImage = this.images[1]

    const isLeftNFT = firstImage?.type === 'NFT'
    const isRightNFT = secondImage?.url ? secondImage.type === 'NFT' : isLeftNFT

    const leftRadius = isLeftNFT ? 'var(--wui-border-radius-xxs)' : 'var(--wui-border-radius-s)'
    const rightRadius = isRightNFT ? 'var(--wui-border-radius-xxs)' : 'var(--wui-border-radius-s)'

    this.style.cssText = `
    --local-left-border-radius: ${leftRadius};
    --local-right-border-radius: ${rightRadius};
    `

    return html`<wui-flex> ${this.templateVisual()} ${this.templateIcon()} </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private templateVisual() {
    const firstImage = this.images[0]
    const firstImageType = firstImage?.type
    const secondImage = this.images[1]

    const isTrade = this.type === 'trade'
    const haveTwoImages = firstImage?.url && secondImage?.url

    if (isTrade || haveTwoImages) {
      return html`<div class="swap-images-container">
        ${firstImage?.url
          ? html`<wui-image src=${firstImage.url} alt="Transaction image"></wui-image>`
          : null}
        ${secondImage?.url
          ? html`<wui-image src=${secondImage.url} alt="Transaction image"></wui-image>`
          : null}
      </div>`
    } else if (firstImage?.url) {
      return html`<wui-image src=${firstImage.url} alt="Transaction image"></wui-image>`
    } else if (firstImageType === 'NFT') {
      return html`<wui-icon size="inherit" color="fg-200" name="nftPlaceholder"></wui-icon>`
    }

    return html`<wui-icon size="inherit" color="fg-200" name="coinPlaceholder"></wui-icon>`
  }

  private templateIcon() {
    let color: 'accent-100' | 'error-100' | 'success-100' | 'inverse-100' = 'accent-100'
    let icon: TransactionIconType | undefined = undefined

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
