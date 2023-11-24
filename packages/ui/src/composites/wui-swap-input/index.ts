import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import '../../components/wui-text/index.js'
import '../wui-transaction-visual/index.js'
import styles from './styles.js'

@customElement('wui-swap-input')
export class WuiSwapInput extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public focused: boolean = false

  @property() public value?: string

  @property() public disabled?: boolean

  @property() public onSelectToken?: () => void

  @property() public onChange?: (event: InputEvent) => void

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex class="${this.focused ? 'focus' : ''}" justifyContent="space-between">
        <wui-flex flex="1" class="swap-input">
          <input
            @focusin=${() => this.onFocusChange(true)}
            @focusout=${() => this.onFocusChange(false)}
            .value=${this.value}
            ?disabled=${this.disabled}
          />
        </wui-flex>
        ${this.templateTokenSelectButton('')}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateTokenSelectButton(token: any) {
    if (!token) {
      return html` <wui-button
        size="md"
        variant="accentBg"
        @click=${this.onSelectToken?.bind(this)}
      >
        Select token
      </wui-button>`
    }

    const tokenElement = token.logoURI
      ? html`<wui-image width="40" height="40" src=${token.logoURI}></wui-image>`
      : html`
          <wui-icon-box
            size="sm"
            iconColor="fg-200"
            backgroundColor="fg-300"
            icon="networkPlaceholder"
          ></wui-icon-box>
        `

    return html`
      <div class="token-select-button-container" @click=${this.onSelectToken?.bind(this)}>
        <button class="token-select-button">
          ${tokenElement}
          <wui-text variant="paragraph-600" color="fg-100">${token.symbol}</wui-text>
        </button>
      </div>
    `
  }

  private onFocusChange(state: boolean) {
    this.focused = state
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-swap-input': WuiSwapInput
  }
}
