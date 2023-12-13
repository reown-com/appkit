import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import '../../composites/wui-button/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-cta-button')
export class WuiCtaButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled = false

  @property() public label = ''

  @property() public buttonLabel = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        justifyContent="space-between"
        alignItems="center"
        .padding=${['1xs', '2l', '1xs', '2l'] as const}
      >
        <wui-text variant="paragraph-500" color="fg-200">${this.label}</wui-text>
        <wui-button size="sm" variant="accent">
          ${this.buttonLabel}
          <wui-icon size="xs" color="inherit" slot="iconRight" name="chevronRight"></wui-icon>
        </wui-button>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-cta-button': WuiCtaButton
  }
}
