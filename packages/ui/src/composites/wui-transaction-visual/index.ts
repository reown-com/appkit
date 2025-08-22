import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import type {
  TransactionDirection,
  TransactionImage,
  TransactionStatus
} from '@reown/appkit-common'

import '../../components/wui-image/index.js'
import type { IconColorType, TransactionIconType, TransactionType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-transaction-visual')
export class WuiTransactionVisual extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() public type?: TransactionType

  @property() public status?: TransactionStatus

  @property() public direction?: TransactionDirection

  @property({ type: Boolean }) public onlyDirectionIcon?: boolean

  @property({ type: Array }) public images: TransactionImage[] = []

  @property({ type: Object }) public secondImage: TransactionImage = {
    type: undefined,
    url: ''
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const [firstImage, secondImage] = this.images

    if (!this.images.length) {
      this.dataset['noImages'] = 'true'
    }

    const isLeftNFT = firstImage?.type === 'NFT'
    const isRightNFT = secondImage?.url ? secondImage.type === 'NFT' : isLeftNFT

    const leftRadius = isLeftNFT ? 'var(--apkt-borderRadius-3)' : 'var(--apkt-borderRadius-5)'
    const rightRadius = isRightNFT ? 'var(--apkt-borderRadius-3)' : 'var(--apkt-borderRadius-5)'

    this.style.cssText = `
    --local-left-border-radius: ${leftRadius};
    --local-right-border-radius: ${rightRadius};
    `

    return html`<wui-flex> ${this.templateVisual()} ${this.templateIcon()} </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private templateVisual() {
    const [firstImage, secondImage] = this.images
    const firstImageType = firstImage?.type
    const hasTwoImages = this.images.length === 2
    if (hasTwoImages && (firstImage?.url || secondImage?.url)) {
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
      return html`<wui-icon size="inherit" color="default" name="nftPlaceholder"></wui-icon>`
    }

    return html`<wui-icon size="inherit" color="default" name="coinPlaceholder"></wui-icon>`
  }

  private templateIcon() {
    let color: IconColorType = 'accent-primary'
    let icon: TransactionIconType | undefined = undefined

    icon = this.getIcon()

    if (this.status) {
      color = this.getStatusColor()
    }

    if (!icon) {
      return null
    }

    return html`
      <wui-flex alignItems="center" justifyContent="center" class="status-box">
        <wui-icon-box size="sm" color=${color} icon=${icon}></wui-icon-box>
      </wui-flex>
    `
  }

  private getDirectionIcon() {
    switch (this.direction) {
      case 'in':
        return 'arrowBottom'
      case 'out':
        return 'arrowTop'
      default:
        return undefined
    }
  }

  private getIcon() {
    if (this.onlyDirectionIcon) {
      return this.getDirectionIcon()
    }

    if (this.type === 'trade') {
      return 'swapHorizontal'
    } else if (this.type === 'approve') {
      return 'checkmark'
    } else if (this.type === 'cancel') {
      return 'close'
    }

    return this.getDirectionIcon()
  }

  private getStatusColor(): IconColorType {
    switch (this.status) {
      case 'confirmed':
        return 'success'
      case 'failed':
        return 'error'
      case 'pending':
        return 'inverse'
      default:
        return 'accent-primary'
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-transaction-visual': WuiTransactionVisual
  }
}
