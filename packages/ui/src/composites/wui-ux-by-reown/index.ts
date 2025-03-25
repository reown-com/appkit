import { LitElement, html } from 'lit'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-ux-by-reown')
export class WuiUxByReown extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        justifyContent="center"
        alignItems="center"
        gap="xs"
        .padding=${['0', '0', 'l', '0']}
      >
        <wui-text variant="small-500" color="fg-100"> UX by </wui-text>
        <wui-icon name="reown" size="xxxl" class="reown-logo"></wui-icon>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-ux-by-reown': WuiUxByReown
  }
}
