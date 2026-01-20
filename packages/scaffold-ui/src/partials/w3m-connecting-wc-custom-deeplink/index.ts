import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  AssetUtil,
  ChainController,
  EventsController,
  MobileWalletUtil,
  OptionsController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-wallet-image'

import styles from './styles.js'

@customElement('w3m-connecting-wc-custom-deeplink')
export class W3mConnectingWcCustomDeeplink extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private readonly wallet = RouterController.state.data?.wallet

  // -- State --------------------------------------------- //
  @state() private isRetrying = false

  public constructor() {
    super()
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-custom-deeplink: No wallet provided')
    }

    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: {
        name: this.wallet.name,
        platform: 'customDeeplink',
        displayIndex: this.wallet?.display_index,
        walletRank: this.wallet?.order,
        view: RouterController.state.view
      }
    })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const walletName = this.wallet?.name ?? 'Wallet'
    const imageSrc = AssetUtil.getWalletImage(this.wallet)

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['10', '5', '5', '5'] as const}
        gap="6"
      >
        <wui-flex gap="2" justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg" imageSrc=${ifDefined(imageSrc)}></wui-wallet-image>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="lg-medium" color="primary">
            Continue in ${walletName}
          </wui-text>
          <wui-text align="center" variant="md-regular" color="secondary">
            Complete the connection in the wallet app
          </wui-text>
        </wui-flex>

        <wui-button
          variant="neutral-secondary"
          size="md"
          ?disabled=${this.isRetrying}
          @click=${this.onRetryDeeplink.bind(this)}
          data-testid="w3m-connecting-widget-secondary-button"
        >
          <wui-icon color="inherit" slot="iconLeft" name="externalLink"></wui-icon>
          Open ${walletName}
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onRetryDeeplink() {
    if (!this.wallet) {
      return
    }

    this.isRetrying = true

    // Re-trigger the deeplink redirect
    MobileWalletUtil.handleMobileDeeplinkRedirect(this.wallet.id, ChainController.state.activeChain, {
      isCoinbaseDisabled: OptionsController.state.enableCoinbase === false
    })

    // Reset after a short delay
    setTimeout(() => {
      this.isRetrying = false
    }, 1000)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-custom-deeplink': W3mConnectingWcCustomDeeplink
  }
}
