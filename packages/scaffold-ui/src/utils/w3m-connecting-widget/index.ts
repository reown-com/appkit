import {
  AssetUtil,
  ConnectionController,
  CoreHelperUtil,
  RouterController,
  SnackController,
  ThemeController
} from '@reown/appkit-core'
import type { IconType } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

export class W3mConnectingWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  protected readonly wallet = RouterController.state.data?.wallet

  protected readonly connector = RouterController.state.data?.connector

  protected timeout?: ReturnType<typeof setTimeout> = undefined

  protected secondaryBtnIcon: IconType = 'refresh'

  protected onConnect?: (() => void) | (() => Promise<void>) = undefined

  protected onRender?: (() => void) | (() => Promise<void>) = undefined

  protected onAutoConnect?: (() => void) | (() => Promise<void>) = undefined

  protected isWalletConnect = true

  private unsubscribe: (() => void)[] = []

  private imageSrc =
    AssetUtil.getWalletImage(this.wallet) ?? AssetUtil.getConnectorImage(this.connector)

  private name = this.wallet?.name ?? this.connector?.name ?? 'Wallet'

  // -- State & Properties -------------------------------- //
  @state() protected isRetrying = false

  @state() protected uri = ConnectionController.state.wcUri

  @state() protected error = ConnectionController.state.wcError

  @state() protected ready = false

  @state() private showRetry = false

  @state() protected secondaryBtnLabel? = 'Try again'

  @state() protected secondaryLabel = 'Accept connection request in the wallet'

  @state() public buffering = false

  @property({ type: Boolean }) public isMobile = false

  @property() public onRetry?: (() => void) | (() => Promise<void>) = undefined

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ConnectionController.subscribeKey('wcUri', val => {
          this.uri = val
          if (this.isRetrying && this.onRetry) {
            this.isRetrying = false
            this.onConnect?.()
          }
        }),
        ConnectionController.subscribeKey('wcError', val => (this.error = val)),
        ConnectionController.subscribeKey('buffering', val => (this.buffering = val))
      ]
    )
    // The uri should be preloaded in the tg ios context so we can safely init as the subscribeKey won't trigger
    if (CoreHelperUtil.isTelegram() && CoreHelperUtil.isIos() && ConnectionController.state.wcUri) {
      this.onConnect?.()
    }
  }

  public override firstUpdated() {
    this.onAutoConnect?.()
    this.showRetry = !this.onAutoConnect
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    clearTimeout(this.timeout)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    this.onRender?.()
    this.onShowRetry()

    const subLabel = this.error
      ? 'Connection can be declined if a previous request is still active'
      : this.secondaryLabel

    let label = `Continue in ${this.name}`

    if (this.buffering) {
      label = 'Connecting...'
    }

    if (this.error) {
      label = 'Connection declined'
    }

    return html`
      <wui-flex
        data-error=${ifDefined(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${['3xl', 'xl', 'xl', 'xl'] as const}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${ifDefined(this.imageSrc)}></wui-wallet-image>

          ${this.error ? null : this.loaderTemplate()}

          <wui-icon-box
            backgroundColor="error-100"
            background="opaque"
            iconColor="error-100"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-text variant="paragraph-500" color=${this.error ? 'error-100' : 'fg-100'}>
            ${label}
          </wui-text>
          <wui-text align="center" variant="small-500" color="fg-200">${subLabel}</wui-text>
        </wui-flex>

        ${this.secondaryBtnLabel
          ? html`
              <wui-button
                variant="accent"
                size="md"
                ?disabled=${this.isRetrying || (!this.error && this.buffering)}
                @click=${this.onTryAgain.bind(this)}
                data-testid="w3m-connecting-widget-secondary-button"
              >
                <wui-icon color="inherit" slot="iconLeft" name=${this.secondaryBtnIcon}></wui-icon>
                ${this.secondaryBtnLabel}
              </wui-button>
            `
          : null}
      </wui-flex>

      ${this.isWalletConnect
        ? html`
            <wui-flex .padding=${['0', 'xl', 'xl', 'xl'] as const} justifyContent="center">
              <wui-link @click=${this.onCopyUri} color="fg-200" data-testid="wui-link-copy">
                <wui-icon size="xs" color="fg-200" slot="iconLeft" name="copy"></wui-icon>
                Copy link
              </wui-link>
            </wui-flex>
          `
        : null}

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `
  }

  // -- Private ------------------------------------------- //
  private onShowRetry() {
    if (this.error && !this.showRetry) {
      this.showRetry = true
      const retryButton = this.shadowRoot?.querySelector('wui-button') as HTMLElement
      retryButton?.animate([{ opacity: 0 }, { opacity: 1 }], {
        fill: 'forwards',
        easing: 'ease'
      })
    }
  }

  private onTryAgain() {
    if (!this.buffering) {
      ConnectionController.setWcError(false)
      if (this.onRetry) {
        this.isRetrying = true
        this.onRetry?.()
      } else {
        this.onConnect?.()
      }
    }
  }

  private loaderTemplate() {
    const borderRadiusMaster = ThemeController.state.themeVariables['--w3m-border-radius-master']
    const radius = borderRadiusMaster ? parseInt(borderRadiusMaster.replace('px', ''), 10) : 4

    return html`<wui-loading-thumbnail radius=${radius * 9}></wui-loading-thumbnail>`
  }

  // -- Protected ----------------------------------------- //
  protected onCopyUri() {
    try {
      if (this.uri) {
        CoreHelperUtil.copyToClopboard(this.uri)
        SnackController.showSuccess('Link copied')
      }
    } catch {
      SnackController.showError('Failed to copy')
    }
  }
}
