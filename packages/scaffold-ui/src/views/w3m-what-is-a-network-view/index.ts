import { LitElement, html } from 'lit'

import { CoreHelperUtil } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'

import '../../partials/w3m-help-widget/index.js'

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
        .padding=${['6', '5', '5', '5'] as const}
        alignItems="center"
        gap="5"
      >
        <w3m-help-widget .data=${data}></w3m-help-widget>
        <wui-button
          variant="accent-primary"
          size="md"
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
