import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-image/index.js'
import '../../components/wui-shimmer/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-token-button')
export class WuiTokenButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc?: string

  @property() public text = ''

  @property({ type: Boolean }) public loading = false

  // -- Render -------------------------------------------- //
  public override render() {
    if (this.loading) {
      return html` <wui-flex alignItems="center" gap="xxs" padding="xs">
        <wui-shimmer width="24px" height="24px"></wui-shimmer>
        <wui-shimmer width="40px" height="20px" borderRadius="4xs"></wui-shimmer>
      </wui-flex>`
    }

    return html`
      <button>
        ${this.tokenTemplate()}
        <wui-text variant="paragraph-600" color="fg-100">${this.text}</wui-text>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private tokenTemplate() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc}></wui-image>`
    }

    return html`
      <wui-icon-box
        size="sm"
        iconColor="fg-200"
        backgroundColor="fg-300"
        icon="networkPlaceholder"
      ></wui-icon-box>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-token-button': WuiTokenButton
  }
}
