import { AssetUtil, CoreHelperUtil, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connecting-wc-unsupported')
export class W3mConnectingWcUnsupported extends LitElement {
  // -- Members ------------------------------------------- //
  private readonly wallet = RouterController.state.data?.wallet

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-unsupported: No wallet provided')
    }

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['3xl', 'xl', '3xl', 'xl'] as const}
        gap="xl"
      >
        <wui-wallet-image
          size="lg"
          imageSrc=${ifDefined(AssetUtil.getWalletImage(this.wallet))}
        ></wui-wallet-image>

        <wui-flex flexDirection="column" alignItems="center" gap="xxs">
          <wui-text variant="paragraph-500" color="fg-100">Not Detected</wui-text>
          <wui-text variant="small-500" color="fg-200" align="center">
            Download and install ${this.wallet.name} to continue
          </wui-text>
        </wui-flex>

        ${this.downloadBtnTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private downloadBtnTemplate() {
    if (!this.wallet) {
      throw new Error('w3m-connecting-wc-unsupported:onDownload No wallet provided')
    }
    const { homepage } = this.wallet
    if (!homepage) {
      return null
    }

    return html`
      <wui-button
        size="sm"
        variant="fill"
        @click=${() => CoreHelperUtil.openHref(homepage, '_blank')}
      >
        <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        Download
      </wui-button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-unsupported': W3mConnectingWcUnsupported
  }
}
