import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

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

  @property({ attribute: false }) public onKeyDown?: (event: KeyboardEvent) => void

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-input-text
        value=${ifDefined(this.value)}
        ?disabled=${this.disabled}
        .value=${this.value || ''}
        data-testid="wui-ens-input"
        icon="search"
        inputRightPadding="5xl"
        .onKeyDown=${this.onKeyDown}
      ></wui-input-text>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-ens-input': WuiEnsInput
  }
}
