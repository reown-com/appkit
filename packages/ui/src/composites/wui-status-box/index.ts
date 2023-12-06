import { html, LitElement } from 'lit'
import { resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-status-box')
export class WUIStatusBox extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<wui-flex>
      <wui-icon-box
        size="xxs"
        iconSize="xxs"
        iconcolor="success-100"
        backgroundcolor="success-100"
        icon="checkmark"
        background="opaque"
      ></wui-icon-box>
    </wui-flex>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-status-box': WUIStatusBox
  }
}
