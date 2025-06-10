import { LitElement, html } from 'lit'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { REOWN_URL } from '../../utils/ConstantsUtil.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-ux-by-reown')
export class WuiUxByReown extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <a
        data-testid="ux-branding-reown"
        href=${REOWN_URL}
        rel="noreferrer"
        target="_blank"
        style="text-decoration: none;"
      >
        <wui-flex
          justifyContent="center"
          alignItems="center"
          gap="xs"
          .padding=${['0', '0', 'l', '0']}
        >
          <wui-text variant="small-500" color="fg-100"> UX by </wui-text>
          <wui-icon name="reown" size="xxxl" class="reown-logo"></wui-icon>
        </wui-flex>
      </a>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-ux-by-reown': WuiUxByReown
  }
}
