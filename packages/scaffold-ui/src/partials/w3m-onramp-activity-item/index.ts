import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { ApiController } from '@reown/appkit-core'
import { type ColorType, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-onramp-activity-item')
export class W3mOnRampActivityItem extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled = false

  @property() color: ColorType = 'inherit'

  @property() public label = 'Bought'

  @property() public purchaseValue = ''

  @property() public purchaseCurrency = ''

  @property() public date = ''

  @property({ type: Boolean }) public completed = false

  @property({ type: Boolean }) public inProgress = false

  @property({ type: Boolean }) public failed = false

  @property() public onClick: (() => void) | null = null

  @property() public symbol = ''

  @property() public icon?: string

  // -- Render -------------------------------------------- //
  public override firstUpdated() {
    if (!this.icon) {
      this.fetchTokenImage()
    }
  }

  public override render() {
    return html`
      <wui-flex>
        ${this.imageTemplate()}
        <wui-flex flexDirection="column" gap="4xs" flexGrow="1">
          <wui-flex gap="xxs" alignItems="center" justifyContent="flex-start">
            ${this.statusIconTemplate()}
            <wui-text variant="paragraph-500" color="fg-100"> ${this.label}</wui-text>
          </wui-flex>
          <wui-text variant="small-400" color="fg-200">
            + ${this.purchaseValue} ${this.purchaseCurrency}
          </wui-text>
        </wui-flex>
        ${this.inProgress
          ? html`<wui-loading-spinner color="fg-200" size="md"></wui-loading-spinner>`
          : html`<wui-text variant="micro-700" color="fg-300"><span>${this.date}</span></wui-text>`}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private async fetchTokenImage() {
    await ApiController._fetchTokenImage(this.purchaseCurrency)
  }

  private statusIconTemplate() {
    if (this.inProgress) {
      return null
    }

    return this.completed ? this.boughtIconTemplate() : this.errorIconTemplate()
  }

  private errorIconTemplate() {
    return html`<wui-icon-box
      size="xxs"
      iconColor="error-100"
      backgroundColor="error-100"
      background="opaque"
      icon="close"
      borderColor="wui-color-bg-125"
    ></wui-icon-box>`
  }

  private imageTemplate() {
    const icon = this.icon || `https://avatar.vercel.sh/andrew.svg?size=50&text=${this.symbol}`

    return html`<wui-flex class="purchase-image-container">
      <wui-image src=${icon}></wui-image>
    </wui-flex>`
  }

  private boughtIconTemplate() {
    return html`<wui-icon-box
      size="xxs"
      iconColor="success-100"
      backgroundColor="success-100"
      background="opaque"
      icon="arrowBottom"
      borderColor="wui-color-bg-125"
    ></wui-icon-box>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-activity-item': W3mOnRampActivityItem
  }
}
