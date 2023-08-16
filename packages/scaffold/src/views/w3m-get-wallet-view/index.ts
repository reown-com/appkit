import { ApiController, CoreHelperUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-get-wallet-view')
export class W3mGetWalletView extends LitElement {
  // -- Members ------------------------------------------- //
  private recommendedWallets = ApiController.state.recommended

  private images = ApiController.state.images

  // -- Render -------------------------------------------- //
  public override render() {
    const walletImages = Object.values(this.images).map(src => ({ src }))

    return html`
      <wui-flex flexDirection="column" padding="s" gap="xs">
        ${this.recommendedWalletsTemplate()}
        <wui-list-wallet
          name="Explore all"
          showAllWallets
          .walletImages=${walletImages}
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
    const { images } = ApiController.state

    return this.recommendedWallets.map(
      wallet => html`
        <wui-list-wallet
          name=${wallet.name ?? 'Unknown'}
          tagLabel="get wallet"
          tagVariant="main"
          imageSrc=${ifDefined(images[wallet.image_id])}
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
