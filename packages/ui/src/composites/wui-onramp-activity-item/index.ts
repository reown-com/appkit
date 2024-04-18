import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ColorType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { ApiController } from '@web3modal/core'

@customElement('wui-onramp-activity-item')
export class WuiOnRampActivityItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

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
    'wui-onramp-activity-item': WuiOnRampActivityItem
  }
}
