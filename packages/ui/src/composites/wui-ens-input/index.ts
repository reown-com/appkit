import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil } from '@reown/appkit-common'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-input-text/index.js'
import styles from './styles.js'

@customElement('wui-ens-input')
export class WuiEnsInput extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public errorMessage?: string

  @property({ type: Boolean }) public disabled = false

  @property() public value?: string

  @property({ type: Boolean }) public loading = false

  @property() public tabIdx?: number

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-input-text
        type="email"
        placeholder="Email"
        icon="user"
        size="lg"
        .disabled=${this.disabled}
        .value=${this.value}
        data-testid="wui-email-input"
        tabIdx=${ifDefined(this.tabIdx)}
        >${this.baseNameTemplate()}</wui-input-text
      >
    `
  }

  // -- Private ------------------------------------------- //
  private baseNameTemplate() {
    return html`<wui-text variant="sm-medium" color="secondary" class="base-name">
      ${ConstantsUtil.WC_NAME_SUFFIX}
    </wui-text>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-ens-input': WuiEnsInput
  }
}
