import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { animate } from 'motion'
import styles from './styles'

@customElement('w3m-connecting-widget')
export class W3mConnectingWidget extends LitElement {
  public static styles = styles

  // -- State & Properties -------------------------------- //
  @state() private showRetry = false

  @property() imageSrc?: string = undefined

  @property({ type: Boolean }) public error = false

  @property() public name = 'Wallet'

  @property() public onConnect?: (() => void) | (() => Promise<void>) = undefined

  @property() public onCopyUri?: (() => void) | (() => Promise<void>) = undefined

  @property({ type: Boolean }) public autoConnect = true

  public firstUpdated() {
    if (this.autoConnect) {
      this.onConnect?.()
    }
    this.showRetry = !this.autoConnect
  }

  // -- Render -------------------------------------------- //
  public render() {
    this.onShowRetry()
    const subLabelColor = this.error ? 'error-100' : 'fg-200'
    const subLabel = this.error ? 'Connection declined' : 'Accept connection request in the wallet'
    const label = `Continue in ${this.name}`

    return html`
      <wui-flex
        data-error=${this.error}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${['3xl', 'xl', '3xl', 'xl'] as const}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${ifDefined(this.imageSrc)}></wui-wallet-image>
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
          <wui-text variant="paragraph-500" color="fg-100">${label}</wui-text>
          <wui-text variant="small-500" color=${subLabelColor}>${subLabel}</wui-text>
        </wui-flex>

        <wui-button
          size="sm"
          variant="fill"
          .disabled=${!this.error && this.autoConnect}
          @click=${this.onConnect}
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try again
        </wui-button>
      </wui-flex>

      ${this.onCopyUri
        ? html`
            <wui-flex .padding=${['0', 'xl', 'xl', 'xl'] as const}>
              <wui-button variant="fullWidth" @click=${this.onCopyUri}>
                <wui-icon size="sm" color="inherit" slot="iconLeft" name="copy"></wui-icon>
                Copy Link
              </wui-button>
            </wui-flex>
          `
        : null}
    `
  }

  // -- Private ------------------------------------------- //
  private onShowRetry() {
    if (this.error && !this.showRetry) {
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
