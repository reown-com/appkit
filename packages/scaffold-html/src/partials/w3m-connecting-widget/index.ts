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

  @property() public label = ''

  @property() public subLabel?: string = undefined

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

    return html`
      <wui-flex
        data-error=${this.error}
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
          <wui-flex gap="3xs" alignItems="center" justifyContent="center">
            <wui-text variant="paragraph-500" color="fg-100">${this.label}</wui-text>

            ${this.onCopyUri
              ? html`
                  <wui-icon-link
                    size="md"
                    icon="copy"
                    iconColor="fg-200"
                    @click=${this.onCopyUri}
                  ></wui-icon-link>
                `
              : null}
          </wui-flex>

          ${this.subLabel
            ? html`<wui-text variant="small-500" color=${subLabelColor}>${this.subLabel}</wui-text>`
            : null}
        </wui-flex>

        <wui-button
          data-retry=${this.showRetry}
          size="sm"
          variant="fill"
          .disabled=${!this.error && this.autoConnect}
          @click=${this.onConnect}
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try again
        </wui-button>
      </wui-flex>
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
