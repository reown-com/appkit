import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil'
import '../../components/wui-icon'
import '../../components/wui-text'
import '../../composites/wui-input'
import styles from './styles'

@customElement('wui-email-input')
export class WuiEmailInput extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public errorMessage?: string

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-input placeholder="Email" icon="mail" size="md">
        <wui-icon size="inherit" color="fg-100" name="chevronRight"></wui-icon>
      </wui-input>
      ${this.templateError()}
    `
  }

  // -- Private ------------------------------------------- //
  private templateError() {
    if (this.errorMessage) {
      return html`<wui-text variant="tiny-500" color="error-100">${this.errorMessage}</wui-text>`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-email-input': WuiEmailInput
  }
}
