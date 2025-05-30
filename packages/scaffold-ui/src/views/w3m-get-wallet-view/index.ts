import { LitElement, html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'

import {
  ApiController,
  AssetUtil,
  CoreHelperUtil,
  OptionsController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-item'

const EXPLORER = 'https://walletconnect.com/explorer'

@customElement('w3m-get-wallet-view')
export class W3mGetWalletView extends LitElement {
  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', 's', 's', 's']} gap="xs">
        ${this.recommendedWalletsTemplate()}
        <wui-list-wallet
          name="Explore all"
          showAllWallets
          walletIcon="allWallets"
          icon="externalLink"
          @click=${() => {
            CoreHelperUtil.openHref('https://walletconnect.com/explorer?type=wallet', '_blank')
          }}
        ></wui-list-wallet>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private recommendedWalletsTemplate() {
    const { recommended, featured } = ApiController.state
    const { customWallets } = OptionsController.state
    const wallets = [...featured, ...(customWallets ?? []), ...recommended].slice(0, 4)

    return wallets.map(
      wallet => html`
        <wui-list-wallet
          name=${wallet.name ?? 'Unknown'}
          tagVariant="main"
          imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
          @click=${() => {
            CoreHelperUtil.openHref(wallet.homepage ?? EXPLORER, '_blank')
          }}
        ></wui-list-wallet>
      `
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-get-wallet-view': W3mGetWalletView
  }
}
