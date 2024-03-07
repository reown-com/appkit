import { RouterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'

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
      gap="l"
    >
      <wui-icon-box
        icon="wallet"
        size="inherit"
        iconColor="fg-200"
        backgroundColor="fg-200"
        iconSize="lg"
      ></wui-icon-box>
      <wui-flex
        class="textContent"
        gap="xs"
        flexDirection="column"
        justifyContent="center"
        flexDirection="column"
      >
        <wui-text variant="paragraph-500" align="center" color="fg-100">No NFTs yet</wui-text>
        <wui-text variant="small-400" align="center" color="fg-200"
          >Transfer from another wallets to get started</wui-text
        >
      </wui-flex>
      <wui-link @click=${this.onReceiveClick.bind(this)}>Receive NFTs</wui-link>
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
