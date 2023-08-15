import { CoreHelperUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

const data = [
  {
    images: ['network', 'layers', 'system'],
    title: 'The system’s nuts and bolts',
    text: 'A network is what brings the blockchain to life, as this technical infrastructure allows apps to access the ledger and smart contract services.'
  },
  {
    images: ['noun', 'defiAlt', 'dao'],
    title: 'Designed for different uses',
    text: 'Each network is designed differently, and may therefore suit certain apps and experiences.'
  }
] as const

@customElement('w3m-what-is-a-network-view')
export class W3mWhatIsANetworkView extends LitElement {
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
        <wui-button
          variant="fill"
          size="sm"
          @click=${() => {
            CoreHelperUtil.openHref('https://ethereum.org/en/developers/docs/networks/', '_blank')
          }}
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
