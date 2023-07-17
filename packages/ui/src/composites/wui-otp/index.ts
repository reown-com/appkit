import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import '../../layout/wui-flex'
import '../wui-input-numeric'

@customElement('wui-otp')
export class WuiOtp extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex gap="s">
        <wui-flex gap="xxs">
          <wui-input-numeric></wui-input-numeric>
          <wui-input-numeric></wui-input-numeric>
          <wui-input-numeric></wui-input-numeric>
        </wui-flex>
        <wui-flex gap="xxs">
          <wui-input-numeric></wui-input-numeric>
          <wui-input-numeric></wui-input-numeric>
          <wui-input-numeric></wui-input-numeric>
        </wui-flex>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-otp': WuiOtp
  }
}
