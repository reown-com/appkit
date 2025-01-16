import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../composites/wui-icon-box/index.js'
import { colorStyles, elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-select')
export class WuiSelect extends LitElement {
  public static override styles = [resetStyles, elementStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<button>
      ${this.imageTemplate()}
      <wui-icon size="xs" color="fg-200" name="chevronBottom"></wui-icon>
    </button>`
  }

  // -- Private ------------------------------------------- //
  private imageTemplate() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt="select visual"></wui-image>`
    }

    return html`<wui-icon-box
      size="xxs"
      iconColor="fg-200"
      backgroundColor="fg-100"
      background="opaque"
      icon="networkPlaceholder"
    ></wui-icon-box>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-select': WuiSelect
  }
}
