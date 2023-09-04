import { ApiController, AssetController, AssetUtil, CoreHelperUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-get-wallet-view')
export class W3mGetWalletView extends LitElement {
  // -- Members ------------------------------------------- //
  private recommendedWallets = ApiController.state.recommended

  // -- Render -------------------------------------------- //
  public override render() {
    const { walletImages } = AssetController.state
    const walletImagesSrc = Object.values(walletImages).map(src => ({ src }))

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
          imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet.image_id))}
          @click=${() => {
            CoreHelperUtil.openHref(wallet.homepage, '_blank')
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
