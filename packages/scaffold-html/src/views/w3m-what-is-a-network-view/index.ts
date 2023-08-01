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
    images: ['network', 'layers', 'system'],
    title: 'The system’s nuts and bolts',
    text: 'A network is what brings the blockchain to life, as this technical infrastructure allows apps to access the ledger and smart contract services.'
  },
  {
    images: ['noun', 'defiAlt', 'dao'],
    title: 'Designed for different uses',
    text: 'A wallet lets you store, send and receive digital assets like cryptocurrencies and NFTs.'
  }
]

@customElement('w3m-what-is-a-network-view')
export class W3mWhatIsANetworkView extends LitElement {
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
        <wui-button
          variant="fill"
          size="sm"
          @click=${() => RouterController.push('WhatIsANetwork')}
        >
          Learn more
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-button>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-what-is-a-network-view': W3mWhatIsANetworkView
  }
}
