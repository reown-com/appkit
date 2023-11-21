import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import { SwapApiController } from '@web3modal/core'

@customElement('w3m-swap-view')
export class W3mSwapView extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  @state() private loading = SwapApiController.state.loading

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
  }

  private getInputElement(el: HTMLElement) {
    if (el.shadowRoot?.querySelector('input')) {
      return el.shadowRoot.querySelector('input')
    }

    return null
  }

  private handleInput(e: InputEvent) {
    const inputElement = e.target as HTMLElement
    const input = this.getInputElement(inputElement)

    if (input) {
      const inputValue = input.value
      SwapApiController.setSourceTokenAmount(inputValue)
    }
  }

  private onSwap() {
    const amount = SwapApiController.state.sourceTokenAmount
    // eslint-disable-next-line no-console
    console.log({ amount })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="s">
        ${this.loading ? this.templateLoading() : this.templateSwap()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateSwap() {
    return html`
      <wui-flex flexDirection="column" gap="sm">
        <wui-flex
          alignItems="center"
          flexDirection="row"
          .padding=${['xs', 's', 's', 's'] as const}
        >
          <wui-text variant="paragraph-500" color="fg-200">Swap tokens</wui-text>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="xl"
          .padding=${['xs', 's', 's', 's'] as const}
        >
          <div>${this.templateSwapTokenSelector()}</div>
          <div>${this.templateSwapTokenSelector()}</div>
        </wui-flex>
        <wui-button @click=${this.onSwap.bind(this)}> Swap </wui-button>
      </wui-flex>
    `
  }

  private templateLoading() {
    return html`<wui-flex
      flexGrow="1"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      .padding=${['3xl', 'xl', '3xl', 'xl'] as const}
      gap="xl"
    >
      <wui-icon-box
        backgroundColor="glass-005"
        background="gray"
        iconColor="fg-200"
        icon="swapHorizontalRoundedBold"
        size="lg"
        ?border=${true}
        borderColor="wui-color-bg-125"
      ></wui-icon-box>
      <wui-text align="center" variant="paragraph-500" color="fg-100">Swaping</wui-text>
      <wui-loading-hexagon></wui-loading-hexagon>
    </wui-flex>`
  }

  private templateSwapTokenSelector() {
    return html`<wui-flex flexDirection="column" justifyContent="space-between" gap="sm">
      <wui-text align="center" variant="paragraph-500" color="fg-200">Amount</wui-text>
      <wui-input-text
        type="number"
        @input=${(e: InputEvent) => this.handleInput(e)}
      ></wui-input-text>
      <wui-text align="center" variant="paragraph-500" color="fg-200">Token</wui-text>
      <select>
        <option>USDC</option>
        <option>ETH</option>
        <option>DAI</option>
        <option>USDT</option>
      </select>
    </wui-flex> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-swap-view': W3mSwapView
  }
}
