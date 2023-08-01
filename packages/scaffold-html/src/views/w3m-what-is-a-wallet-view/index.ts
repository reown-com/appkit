import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { RouterController } from '@web3modal/core'
import { resetStyles } from '@web3modal/ui/src/utils/ThemeUtil'

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
  public static styles = [resetStyles]

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex
        flexDirection="column"
        .padding=${['xxl', 'xl', 'xl', 'xl'] as const}
        alignItems="center"
        gap="xl"
      >
        <w3m-help-widget .data=${data}></w3m-help-widget>
        <wui-button variant="fill" size="sm" @click=${() => RouterController.push('WhatIsAWallet')}>
          <wui-icon color="inherit" slot="iconLeft" name="extension"></wui-icon>
          Get a Wallet
        </wui-button>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-what-is-a-wallet-view': W3mWhatIsAWalletView
  }
}
