import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import type { TransactionThumbnailSize, TransactionThumbnailType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //
const ICON_SIZE = {
  sm: 'xxs',
  lg: 'md'
}

@customElement('wui-transaction-thumbnail')
export class WuiTransactionThumbnail extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() public type: TransactionThumbnailType = 'approve'

  @property() public size: TransactionThumbnailSize = 'lg'

  @property() public statusImageUrl? = ''

  @property({ type: Array }) public images: string[] = []

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<wui-flex>${this.templateVisual()} ${this.templateIcon()}</wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private templateVisual() {
    this.dataset['size'] = this.size

    switch (this.type) {
      case 'trade':
        return this.swapTemplate()

      case 'fiat':
        return this.fiatTemplate()

      case 'unknown':
        return this.unknownTemplate()

      default:
        return this.tokenTemplate()
    }
  }

  private swapTemplate() {
    const [firstImageUrl, secondImageUrl] = this.images

    const twoImages = this.images.length === 2 && (firstImageUrl || secondImageUrl)

    if (twoImages) {
      return html`
        <wui-image class="swap-crop-left-image" src=${firstImageUrl} alt="Swap image"></wui-image>
        <wui-image class="swap-crop-right-image" src=${secondImageUrl} alt="Swap image"></wui-image>
      `
    }

    if (firstImageUrl) {
      return html`<wui-image src=${firstImageUrl} alt="Swap image"></wui-image>`
    }

    return null
  }

  private fiatTemplate() {
    return html`<wui-icon
      class="fallback-icon"
      size=${ICON_SIZE[this.size]}
      name="dollar"
    ></wui-icon>`
  }

  private unknownTemplate() {
    return html`<wui-icon
      class="fallback-icon"
      size=${ICON_SIZE[this.size]}
      name="questionMark"
    ></wui-icon>`
  }

  private tokenTemplate() {
    const [imageUrl] = this.images

    if (imageUrl) {
      return html`<wui-image src=${imageUrl} alt="Token image"></wui-image> `
    }

    return html`<wui-icon
      class="fallback-icon"
      name=${this.type === 'nft' ? 'image' : 'coinPlaceholder'}
    ></wui-icon>`
  }

  private templateIcon() {
    if (this.statusImageUrl) {
      return html`<wui-image
        class="status-image"
        src=${this.statusImageUrl}
        alt="Status image"
      ></wui-image>`
    }

    return html`<wui-icon
      class="direction-icon"
      size=${ICON_SIZE[this.size]}
      name=${this.getTemplateIcon()}
    ></wui-icon>`
  }

  private getTemplateIcon() {
    if (this.type === 'trade') {
      return 'arrowClockWise'
    }

    return 'arrowBottom'
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-transaction-thumbnail': WuiTransactionThumbnail
  }
}
