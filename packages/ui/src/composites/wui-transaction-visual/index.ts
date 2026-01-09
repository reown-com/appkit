import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import type {
  TransactionDirection,
  TransactionImage,
  TransactionStatus
} from '@reown/appkit-common'

import '../../components/wui-icon/index.js'
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

  @state() private failedImageUrls = new Set<string>()

  // -- Private ------------------------------------------- //
  private handleImageError(url: string) {
    return (event: Event) => {
      event.stopPropagation()
      this.failedImageUrls.add(url)
      this.requestUpdate()
    }
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
    const hasTwoImages = this.images.length === 2

    if (hasTwoImages && (firstImage?.url || secondImage?.url)) {
      return this.renderSwapImages(firstImage, secondImage)
    }

    if (firstImage?.url && !this.failedImageUrls.has(firstImage.url)) {
      return this.renderSingleImage(firstImage)
    }

    if (firstImage?.type === 'NFT') {
      return this.renderPlaceholderIcon('nftPlaceholder')
    }

    return this.renderPlaceholderIcon('coinPlaceholder')
  }

  private renderSwapImages(firstImage?: TransactionImage, secondImage?: TransactionImage) {
    return html`<div class="swap-images-container">
      ${firstImage?.url ? this.renderImageOrFallback(firstImage, 'first', true) : null}
      ${secondImage?.url ? this.renderImageOrFallback(secondImage, 'last', true) : null}
    </div>`
  }

  private renderSingleImage(image: TransactionImage) {
    return this.renderImageOrFallback(image, undefined, false)
  }

  private renderImageOrFallback(
    image: TransactionImage,
    position?: 'first' | 'last',
    isInSwapContainer = false
  ) {
    if (!image.url) {
      return null
    }

    if (this.failedImageUrls.has(image.url)) {
      if (isInSwapContainer && position) {
        return this.renderFallbackIconInContainer(position)
      }

      return this.renderFallbackIcon()
    }

    return html`<wui-image
      src=${image.url}
      alt="Transaction image"
      @onLoadError=${this.handleImageError(image.url)}
    ></wui-image>`
  }

  private renderFallbackIconInContainer(position: 'first' | 'last') {
    return html`<div class="swap-fallback-container ${position}">${this.renderFallbackIcon()}</div>`
  }

  private renderFallbackIcon() {
    return html`<wui-icon
      size="xl"
      weight="regular"
      color="default"
      name="networkPlaceholder"
    ></wui-icon>`
  }

  private renderPlaceholderIcon(iconName: 'nftPlaceholder' | 'coinPlaceholder') {
    return html`<wui-icon size="xl" weight="regular" color="default" name=${iconName}></wui-icon>`
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
