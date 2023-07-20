import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { animate } from 'motion'
import styles from './styles'

@customElement('w3m-connecting-widget')
export class W3mConnectingWidget extends LitElement {
  public static styles = styles

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public error = false

  @property({ type: Boolean }) public showRetry = false

  @property() public label = ''

  @property() public subLabel = ''

  @property() public onConnect?: () => Promise<void> = undefined

  public firstUpdated() {
    this.onConnect?.()
  }

  // -- Render -------------------------------------------- //
  public render() {
    const subLabelColor = this.error ? 'error-100' : 'fg-200'

    return html`
      <wui-flex
        data-error=${this.error}
        flexDirection="column"
        alignItems="center"
        .padding=${['3xl', 'xl', '3xl', 'xl'] as const}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg"></wui-wallet-image>
          ${this.error ? null : html`<wui-loading-thumbnail></wui-loading-thumbnail>`}
          <wui-icon-box
            backgroundColor="error-100"
            background="opaque"
            iconColor="error-100"
            icon="close"
            size="sm"
            border
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-text variant="paragraph-500" color="fg-100">${this.label}</wui-text>
          <wui-text variant="small-500" color=${subLabelColor}>${this.subLabel}</wui-text>
        </wui-flex>

        <wui-button
          data-retry=${this.showRetry}
          size="sm"
          variant="fill"
          .disabled=${!this.error}
          @click=${this.onConnect?.bind(this)}
        >
          <wui-icon color="inherit" slot="iconLeft" name="swapHorizontal"></wui-icon>
          Try again
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onShowRetry() {
    if (!this.showRetry) {
      this.showRetry = true
      const retryButton = this.shadowRoot?.querySelector('wui-button') as HTMLElement
      animate(retryButton, { opacity: [0, 1] })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-widget': W3mConnectingWidget
  }
}
