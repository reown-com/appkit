import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { RouterController } from '@web3modal/core'
import { resetStyles } from '@web3modal/ui/src/utils/ThemeUtil'

const data = [
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
] as const

@customElement('w3m-what-is-a-network-view')
export class W3mWhatIsANetworkView extends LitElement {
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
