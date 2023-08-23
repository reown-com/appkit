import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ButtonType } from '../../utils/TypesUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-network-button')
export class WuiNetworkButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc?: string = undefined

  @property() public name = 'Unknown'

  @property() public variant: Exclude<ButtonType, 'accent' | 'fullwidth'> = 'fill'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button data-variant=${this.variant}>
        ${this.visualTemplate()}
        <wui-text variant="paragraph-600" color="inherit"> ${this.name} </wui-text>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private visualTemplate() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc}></wui-image>`
    }

    return html`
      <wui-icon-box
        size="sm"
        iconColor="inverse-100"
        backgroundColor="accent-100"
        icon="networkPlaceholder"
      ></wui-icon-box>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-network-button': WuiNetworkButton
  }
}
