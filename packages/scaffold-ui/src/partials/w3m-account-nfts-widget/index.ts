import { LitElement, html } from 'lit'

import { RouterController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-account-nfts-widget')
export class W3mAccountNftsWidget extends LitElement {
  public static override styles = styles

  // -- Render -------------------------------------------- //
  public override render() {
    return html`${this.nftTemplate()}`
  }

  // -- Private ------------------------------------------- //
  private nftTemplate() {
    return html` <wui-flex
      class="contentContainer"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      gap="5"
    >
      <wui-icon-box icon="wallet" size="lg" color="default"></wui-icon-box>
      <wui-flex
        class="textContent"
        gap="2"
        flexDirection="column"
        justifyContent="center"
        flexDirection="column"
      >
        <wui-text
          variant="md-regular"
          align="center"
          color="primary"
          data-testid="nft-template-title"
          >Coming soon</wui-text
        >
        <wui-text
          variant="sm-regular"
          align="center"
          color="secondary"
          data-testid="nft-template-description"
          >Stay tuned for our upcoming NFT feature</wui-text
        >
      </wui-flex>
      <wui-link @click=${this.onReceiveClick.bind(this)} data-testid="link-receive-funds"
        >Receive funds</wui-link
      >
    </wui-flex>`
  }

  private onReceiveClick() {
    RouterController.push('WalletReceive')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-nfts-widget': W3mAccountNftsWidget
  }
}
