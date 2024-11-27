import { html, LitElement } from 'lit'
import { resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { logoSvg } from './logo.js'

@customElement('wui-powered-by')
export class WuiPoweredBy extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex alignItems="center" justifyContent="center" columnGap="1">
        <wui-text variant="sm-regular" color="secondary">UX by</wui-text>
        ${logoSvg}
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-powered-by': WuiPoweredBy
  }
}
