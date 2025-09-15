import { LitElement, html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

import { AssetUtil, EventsController, RouterController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-wallet-image'

import '../w3m-mobile-download-links/index.js'

@customElement('w3m-connecting-wc-unsupported')
export class W3mConnectingWcUnsupported extends LitElement {
  // -- Members ------------------------------------------- //
  private readonly wallet = RouterController.state.data?.wallet

  public constructor() {
    super()
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-unsupported: No wallet provided')
    }

    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WALLET',
      properties: {
        name: this.wallet.name,
        platform: 'browser',
        displayIndex: this.wallet?.display_index,
        walletRank: this.wallet?.order,
        view: RouterController.state.view
      }
    })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['10', '5', '5', '5'] as const}
        gap="5"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${ifDefined(AssetUtil.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-text variant="md-regular" color="primary">Not Detected</wui-text>
      </wui-flex>

      <w3m-mobile-download-links .wallet=${this.wallet}></w3m-mobile-download-links>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-unsupported': W3mConnectingWcUnsupported
  }
}
