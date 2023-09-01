import { ConnectionController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { animate } from 'motion'
import styles from './styles.js'

@customElement('w3m-connecting-widget')
export class W3mConnectingWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private showRetry = false

  @property({ type: Boolean }) public error = false

  @property({ type: Boolean }) public buffering = false

  @property({ type: Boolean }) public autoConnect = true

  @property() imageSrc?: string = undefined

  @property() public name = 'Wallet'

  @property() public onConnect?: (() => void) | (() => Promise<void>) = undefined

  @property() public onRetry?: (() => void) | (() => Promise<void>) = undefined

  @property() public onCopyUri?: (() => void) | (() => Promise<void>) = undefined

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectionController.subscribeKey('wcUri', () => {
        if (this.onRetry) {
          this.onConnect?.()
        }
      })
    )
  }

  public override firstUpdated() {
    if (this.autoConnect) {
      this.onConnect?.()
    }
    this.showRetry = !this.autoConnect
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.onShowRetry()
    const subLabel = this.error
      ? 'Connection can be declined if a previous request is still active'
      : 'Accept connection request in the wallet'

    let label = `Continue in ${this.name}`

    if (this.buffering) {
      label = 'Connecting...'
    }

    if (this.error) {
      label = 'Connection declined'
    }

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
          <wui-text variant="paragraph-500" color=${this.error ? 'error-100' : 'fg-100'}>
            ${label}
          </wui-text>
          <wui-text align="center" variant="small-500" color="fg-200">${subLabel}</wui-text>
        </wui-flex>

        <wui-button
          variant="accent"
          ?disabled=${!this.error && (this.autoConnect || this.buffering)}
          @click=${this.onTryAgain.bind(this)}
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

  private onTryAgain() {
    if (!this.buffering) {
      ConnectionController.setWcError(false)
      if (this.onRetry) {
        this.onRetry?.()
      } else {
        this.onConnect?.()
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-widget': W3mConnectingWidget
  }
}
