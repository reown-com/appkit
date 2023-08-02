import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import styles from './styles.js'

@customElement('wui-separator')
export class WuiSeparator extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public text? = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`${this.template()}`
  }

  // -- Private ------------------------------------------- //
  private template() {
    if (this.text) {
      return html`<wui-text variant="small-500" color="fg-200">${this.text}</wui-text>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-separator': WuiSeparator
  }
}
