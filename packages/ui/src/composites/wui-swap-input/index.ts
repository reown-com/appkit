import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import '../../components/wui-text/index.js'
import '../wui-transaction-visual/index.js'
import { EventsController, RouterController } from '@web3modal/core'
import styles from './styles.js'
import type { TokenInfo } from '@web3modal/core/dist/types/src/controllers/SwapApiController.js'

type Target = 'sourceToken' | 'toToken'

@customElement('wui-swap-input')
export class WuiSwapInput extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public focused: boolean = false

  @property() public value?: string

  @property() public disabled?: boolean

  @property() public target: Target = 'sourceToken'

  @property() public token: TokenInfo | undefined

  @property() public onChange?: (event: InputEvent) => void

  // -- Render -------------------------------------------- //
  public override render() {
    console.log('swap-input', this.token, this.target)

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
        ${this.templateTokenSelectButton()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateTokenSelectButton() {
    if (!this.token) {
      return html` <wui-button size="md" variant="accentBg" @click=${this.onSelectToken.bind(this)}>
        Select token
      </wui-button>`
    }

    const tokenElement = this.token.logoURI
      ? html`<wui-image src=${this.token.logoURI}></wui-image>`
      : html`
          <wui-icon-box
            size="sm"
            iconColor="fg-200"
            backgroundColor="fg-300"
            icon="networkPlaceholder"
          ></wui-icon-box>
        `

    return html`
      <div class="token-select-button-container" @click=${this.onSelectToken.bind(this)}>
        <button class="token-select-button">
          ${tokenElement}
          <wui-text variant="paragraph-600" color="fg-100">${this.token.symbol}</wui-text>
        </button>
      </div>
    `
  }

  private onFocusChange(state: boolean) {
    this.focused = state
  }

  private onSelectToken(target: Target) {
    EventsController.sendEvent({ type: 'track', event: 'CLICK_SELECT_TOKEN_TO_SWAP' })
    RouterController.push('SwapSelectToken', {
      target: this.target
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-swap-input': WuiSwapInput
  }
}
