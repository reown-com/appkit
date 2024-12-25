import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'

import styles from './styles.js'
import { ConnectorController, OptionsController } from '@reown/appkit-core'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ConnectorUtil } from '../../utils/ConnectorUtil.js'
@customElement('w3m-connector-list')
export class W3mConnectorList extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const { custom, recent, announced, injected, multiChain, recommended, featured, external } =
      ConnectorUtil.getConnectorsByType(this.connectors)

    const enableWalletConnect = OptionsController.state.enableWalletConnect

    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${enableWalletConnect
          ? html`<w3m-connect-walletconnect-widget
              tabIdx=${ifDefined(this.tabIdx)}
            ></w3m-connect-walletconnect-widget>`
          : null}
        ${recent.length
          ? html`<w3m-connect-recent-widget
              tabIdx=${ifDefined(this.tabIdx)}
            ></w3m-connect-recent-widget>`
          : null}
        ${multiChain.length
          ? html`<w3m-connect-multi-chain-widget
              tabIdx=${ifDefined(this.tabIdx)}
            ></w3m-connect-multi-chain-widget>`
          : null}
        ${announced.length
          ? html`<w3m-connect-announced-widget
              tabIdx=${ifDefined(this.tabIdx)}
            ></w3m-connect-announced-widget>`
          : null}
        ${injected.length
          ? html`<w3m-connect-injected-widget
              tabIdx=${ifDefined(this.tabIdx)}
            ></w3m-connect-injected-widget>`
          : null}
        ${featured.length
          ? html`<w3m-connect-featured-widget
              tabIdx=${ifDefined(this.tabIdx)}
            ></w3m-connect-featured-widget>`
          : null}
        ${custom?.length
          ? html`<w3m-connect-custom-widget
              tabIdx=${ifDefined(this.tabIdx)}
            ></w3m-connect-custom-widget>`
          : null}
        ${external.length
          ? html`<w3m-connect-external-widget
              tabIdx=${ifDefined(this.tabIdx)}
            ></w3m-connect-external-widget>`
          : null}
        ${recommended.length
          ? html`<w3m-connect-recommended-widget
              tabIdx=${ifDefined(this.tabIdx)}
            ></w3m-connect-recommended-widget>`
          : null}
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connector-list': W3mConnectorList
  }
}
