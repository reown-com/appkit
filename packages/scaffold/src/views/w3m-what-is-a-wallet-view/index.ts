import { EventsController, RouterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'

const data = [
  {
    images: ['login', 'profile', 'lock'],
    title: 'One login for all of web3',
    text: 'Log in to any app by connecting your wallet. Say goodbye to countless passwords!'
  },
  {
    images: ['defi', 'nft', 'eth'],
    title: 'A home for your digital assets',
    text: 'A wallet lets you store, send and receive digital assets like cryptocurrencies and NFTs.'
  },
  {
    images: ['browser', 'noun', 'dao'],
    title: 'Your gateway to a new web',
    text: 'With your wallet, you can explore and interact with DeFi, NFTs, DAOs, and much more.'
  }
] as const

@customElement('w3m-what-is-a-wallet-view')
export class W3mWhatIsAWalletView extends LitElement {
  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        flexDirection="column"
        .padding=${['xxl', 'xl', 'xl', 'xl'] as const}
        alignItems="center"
        gap="xl"
      >
        <w3m-help-widget .data=${data}></w3m-help-widget>
        <wui-button variant="fill" size="sm" @click=${this.onGetWallet.bind(this)}>
          <wui-icon color="inherit" slot="iconLeft" name="wallet"></wui-icon>
          Get a wallet
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onGetWallet() {
    EventsController.sendEvent({ type: 'track', event: 'CLICK_GET_WALLET' })
    RouterController.push('GetWallet')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-what-is-a-wallet-view': W3mWhatIsAWalletView
  }
}
