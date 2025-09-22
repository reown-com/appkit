import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  AssetUtil,
  type Connector,
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-wallet-image'

import styles from './styles.js'

@customElement('w3m-connecting-multi-chain-view')
export class W3mConnectingMultiChainView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() protected activeConnector = ConnectorController.state.activeConnector

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[ConnectorController.subscribeKey('activeConnector', val => (this.activeConnector = val))]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['3', '5', '5', '5'] as const}
        gap="5"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-wallet-image
            size="lg"
            imageSrc=${ifDefined(AssetUtil.getConnectorImage(this.activeConnector))}
          ></wui-wallet-image>
        </wui-flex>
        <wui-flex
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${['0', '3', '0', '3'] as const}
        >
          <wui-text variant="lg-medium" color="primary">
            Select Chain for ${this.activeConnector?.name}
          </wui-text>
          <wui-text align="center" variant="lg-regular" color="secondary"
            >Select which chain to connect to your multi chain wallet</wui-text
          >
        </wui-flex>
        <wui-flex
          flexGrow="1"
          flexDirection="column"
          alignItems="center"
          gap="2"
          .padding=${['2', '0', '2', '0'] as const}
        >
          ${this.networksTemplate()}
        </wui-flex>
      </wui-flex>
    `
  }

  // Private Methods ------------------------------------- //
  private networksTemplate() {
    return this.activeConnector?.connectors?.map(connector =>
      connector.name
        ? html`
            <w3m-list-wallet
              imageSrc=${ifDefined(AssetUtil.getChainImage(connector.chain))}
              name=${ConstantsUtil.CHAIN_NAME_MAP[connector.chain]}
              @click=${() => this.onConnector(connector)}
              size="sm"
              data-testid="wui-list-chain-${connector.chain}"
              rdnsId=${connector.explorerWallet?.rdns}
            ></w3m-list-wallet>
          `
        : null
    )
  }

  private onConnector(provider: Connector) {
    const connector = this.activeConnector?.connectors?.find(p => p.chain === provider.chain)
    const redirectView = RouterController.state.data?.redirectView

    if (!connector) {
      SnackController.showError('Failed to find connector')

      return
    }

    if (connector.id === 'walletConnect') {
      if (CoreHelperUtil.isMobile()) {
        RouterController.push('AllWallets')
      } else {
        RouterController.push('ConnectingWalletConnect', { redirectView })
      }
    } else {
      RouterController.push('ConnectingExternal', {
        connector,
        redirectView,
        wallet: this.activeConnector?.explorerWallet
      })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-multi-chain-view': W3mConnectingMultiChainView
  }
}
