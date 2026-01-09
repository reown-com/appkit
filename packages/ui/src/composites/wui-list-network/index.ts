import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-logo/index.js'
import styles from './styles.js'

@customElement('wui-list-network')
export class WuiListNetwork extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc?: string = undefined

  @property() public name = 'Ethereum'

  @property() public tabIdx?: boolean

  @property({ type: Boolean }) public disabled = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.disabled} tabindex=${ifDefined(this.tabIdx)}>
        <wui-flex gap="2" alignItems="center">
          ${this.imageTemplate()}
          <wui-text variant="lg-regular" color="primary">${this.name}</wui-text>
        </wui-flex>
        <wui-icon name="chevronRight" size="lg" color="default"></wui-icon>
      </button>
    `
  }

  private imageTemplate() {
    if (this.imageSrc) {
      return html`<wui-image ?boxed=${true} src=${this.imageSrc}></wui-image>`
    }

    return html`<wui-image
      ?boxed=${true}
      icon="networkPlaceholder"
      size="lg"
      iconColor="default"
    ></wui-image>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-network': WuiListNetwork
  }
}
