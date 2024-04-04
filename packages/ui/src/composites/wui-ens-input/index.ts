import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-input-text/index.js'
import styles from './styles.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('wui-ens-input')
export class WuiEnsInput extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- Members ------------------------------------------- //
  public inputElementRef = createRef<HTMLInputElement>()

  // -- State & Properties -------------------------------- //
  @property() public errorMessage?: string

  @property({ type: Boolean }) public disabled = false

  @property() public value?: string

  @property({ type: Boolean }) public loading = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <input
        ${ref(this.inputElementRef)}
        ?disabled=${this.disabled}
        @input=${this.dispatchInputChangeEvent.bind(this)}
        value=${ifDefined(this.value)}
        .value=${this.value || ''}
      />
      ${this.baseNameTemplate()} ${this.errorTemplate()}${this.loadingTemplate()}
    `
  }

  // -- Private ------------------------------------------- //
  private baseNameTemplate() {
    return html`<wui-text variant="paragraph-400" color="fg-200" class="base-name">
      .wc.ink
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

  private dispatchInputChangeEvent() {
    this.dispatchEvent(
      new CustomEvent('inputChange', {
        detail: this.inputElementRef.value?.value,
        bubbles: true,
        composed: true
      })
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-ens-input': WuiEnsInput
  }
}
