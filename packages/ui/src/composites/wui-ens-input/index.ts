import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil } from '@reown/appkit-common'

import '../../components/wui-loading-spinner/index.js'
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
        inputRightPadding="5xl"
        .onKeyDown=${this.onKeyDown}
      >
        ${this.baseNameTemplate()} ${this.errorTemplate()}${this.loadingTemplate()}
      </wui-input-text>
    `
  }

  // -- Private ------------------------------------------- //
  private baseNameTemplate() {
    return html`<wui-text variant="paragraph-400" color="fg-200" class="base-name">
      ${ConstantsUtil.WC_NAME_SUFFIX}
    </wui-text>`
  }

  private loadingTemplate() {
    return this.loading
      ? html`<wui-loading-spinner size="md" color="accent-100"></wui-loading-spinner>`
      : null
  }

  private errorTemplate() {
    if (this.errorMessage) {
      return html`<wui-text variant="tiny-500" color="error-100" class="error"
        >${this.errorMessage}</wui-text
      >`
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-ens-input': WuiEnsInput
  }
}
