import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

import styles from './styles'
import { VisualType } from '@web3modal/ui/src/utils/TypesUtil'
import { RouterController } from '@web3modal/core'

type Data = {
  images: VisualType[]
  title: string
  text: string
}

const data: Data[] = [
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
]

@customElement('w3m-what-is-a-wallet-view')
export class W3mWhatIsAWalletView extends LitElement {
  public static styles = styles

  // -- Render -------------------------------------------- //

  public render() {
    return html`
      <wui-flex
        flexDirection="column"
        .padding=${['xxl', 'xl', 'xl', 'xl'] as const}
        alignItems="center"
        gap="xl"
      >
        ${data.map(
          item =>
            html`<wui-flex flexDirection="column" alignItems="center" gap="xl">
                <wui-flex flexDirection="row" justifyContent="center" gap="1xs">
                  ${item.images.map(image => html`<wui-visual name=${image}></wui-visual>`)}
                </wui-flex>
              </wui-flex>
              <wui-flex flexDirection="column" alignItems="center" gap="xs">
                <wui-text variant="paragraph-500" color="fg-100" align="center">
                  ${item.title}</wui-text
                >
                <wui-text variant="small-500" color="fg-200" align="center">
                  ${item.text}
                </wui-text>
              </wui-flex>`
        )}
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
