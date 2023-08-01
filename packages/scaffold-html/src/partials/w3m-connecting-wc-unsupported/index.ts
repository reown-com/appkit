import { CoreHelperUtil, ExplorerApiController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connecting-wc-unsupported')
export class W3mConnectingWcUnsupported extends LitElement {
  // -- Members ------------------------------------------- //
  private readonly listing = RouterController.state.data?.listing

  private readonly images = ExplorerApiController.state.images

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.listing) {
      throw new Error('w3m-connecting-wc-unsupported: No listing provided')
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
          imageSrc=${ifDefined(this.images[this.listing.image_id])}
        ></wui-wallet-image>

        <wui-flex flexDirection="column" alignItems="center" gap="xxs">
          <wui-text variant="paragraph-500" color="fg-100">Not Detected</wui-text>
          <wui-text variant="small-500" color="fg-200" align="center">
            Download and install ${this.listing.name} to continue
          </wui-text>
        </wui-flex>

        <wui-button size="sm" variant="fill" @click=${this.onDownload}>
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
          Download
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onDownload() {
    if (!this.listing) {
      throw new Error('w3m-connecting-wc-unsupported:onDownload No listing provided')
    }

    CoreHelperUtil.openHref(this.listing.homepage, '_blank')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-wc-unsupported': W3mConnectingWcUnsupported
  }
}
