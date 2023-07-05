import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-text'
import { resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'

@customElement('wui-separator')
export class WuiSeparator extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public showText = false

  // -- Render -------------------------------------------- //
  public render() {
    return html`${this.template()}`
  }

  // -- Private ------------------------------------------- //
  private template() {
    if (this.showText) {
      return html`<wui-text variant="small-500" color="fg-200">or</wui-text>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-separator': WuiSeparator
  }
}
