import { ApiController, AssetUtil, CoreHelperUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

const EXPLORER = 'https://walletconnect.com/explorer'

@customElement('w3m-get-wallet-view')
export class W3mGetWalletView extends LitElement {
  // -- Members ------------------------------------------- //
  private recommendedWallets = ApiController.state.recommended

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="xs">
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
    return this.recommendedWallets.map(
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
