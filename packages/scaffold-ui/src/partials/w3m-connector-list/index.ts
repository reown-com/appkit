import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ApiController, ConnectorController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'

import '../../partials/w3m-connect-announced-widget/index.js'
import '../../partials/w3m-connect-custom-widget/index.js'
import '../../partials/w3m-connect-external-widget/index.js'
import '../../partials/w3m-connect-featured-widget/index.js'
import '../../partials/w3m-connect-injected-widget/index.js'
import '../../partials/w3m-connect-multi-chain-widget/index.js'
import '../../partials/w3m-connect-recent-widget/index.js'
import '../../partials/w3m-connect-recommended-widget/index.js'
import '../../partials/w3m-connect-walletconnect-widget/index.js'
import { ConnectorUtil } from '../../utils/ConnectorUtil.js'
import styles from './styles.js'

@customElement('w3m-connector-list')
export class W3mConnectorList extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number = undefined

  @state() private connectors = ConnectorController.state.connectors

  @state() private recommended = ApiController.state.recommended

  @state() private featured = ApiController.state.featured

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val)),
      ApiController.subscribeKey('recommended', val => (this.recommended = val)),
      ApiController.subscribeKey('featured', val => (this.featured = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="xs"> ${this.connectorListTemplate()} </wui-flex>
    `
  }

  // -- Private ------------------------------------------ //
  private connectorListTemplate() {
    const { custom, recent, announced, injected, multiChain, recommended, featured, external } =
      ConnectorUtil.getConnectorsByType(this.connectors, this.recommended, this.featured)

    const connectorTypeOrder = ConnectorUtil.getConnectorTypeOrder({
      custom,
      recent,
      announced,
      injected,
      multiChain,
      recommended,
      featured,
      external
    })

    return connectorTypeOrder.map(type => {
      switch (type) {
        /*
         * We merged injected, announced, and multi-chain connectors
         * into a single connector type (injected) to reduce confusion
         */
        case 'injected':
          return html`
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
                  .connectors=${injected}
                  tabIdx=${ifDefined(this.tabIdx)}
                ></w3m-connect-injected-widget>`
              : null}
          `

        case 'walletConnect':
          return html`<w3m-connect-walletconnect-widget
            tabIdx=${ifDefined(this.tabIdx)}
          ></w3m-connect-walletconnect-widget>`

        case 'recent':
          return html`<w3m-connect-recent-widget
            tabIdx=${ifDefined(this.tabIdx)}
          ></w3m-connect-recent-widget>`

        case 'featured':
          return html`<w3m-connect-featured-widget
            .wallets=${featured}
            tabIdx=${ifDefined(this.tabIdx)}
          ></w3m-connect-featured-widget>`

        case 'custom':
          return html`<w3m-connect-custom-widget
            tabIdx=${ifDefined(this.tabIdx)}
          ></w3m-connect-custom-widget>`

        case 'external':
          return html`<w3m-connect-external-widget
            tabIdx=${ifDefined(this.tabIdx)}
          ></w3m-connect-external-widget>`

        case 'recommended':
          return html`<w3m-connect-recommended-widget
            .wallets=${recommended}
            tabIdx=${ifDefined(this.tabIdx)}
          ></w3m-connect-recommended-widget>`

        default:
          // eslint-disable-next-line no-console
          console.warn(`Unknown connector type: ${type}`)

          return null
      }
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connector-list': W3mConnectorList
  }
}
