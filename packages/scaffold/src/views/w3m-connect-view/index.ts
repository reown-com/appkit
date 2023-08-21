import type { Connector } from '@web3modal/core'
import {
  AssetController,
  AssetUtil,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  RouterController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
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
    return html`
      <wui-flex flexDirection="column" padding="s" gap="xs">
        ${this.connectorsTemplate()} ${this.dynamicTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private connectorsTemplate() {
    return this.connectors.map(connector => {
      const { tagLabel, tagVariant } = this.getTag(connector)

      return html`
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector.imageId))}
          name=${connector.name ?? 'Unknown'}
          @click=${() => this.onConnector(connector)}
          tagLabel=${ifDefined(tagLabel)}
          tagVariant=${ifDefined(tagVariant)}
        >
        </wui-list-wallet>
      `
    })
  }

  private dynamicTemplate() {
    if (CoreHelperUtil.isMobile()) {
      return null
    }

    const { walletImages } = AssetController.state
    const walletImagesSrc = Object.values(walletImages).map(src => ({ src }))

    return html`
      <wui-list-wallet
        name="All Wallets"
        showAllWallets
        .walletImages=${walletImagesSrc}
        @click=${this.onAllWallets.bind(this)}
      ></wui-list-wallet>
    `
  }

  private getTag(connector: Connector) {
    if (connector.type === 'WALLET_CONNECT') {
      if (CoreHelperUtil.isMobile()) {
        return { tagLabel: 'all', tagVariant: 'main' } as const
      }

      return { tagLabel: 'qr code', tagVariant: 'main' } as const
    }
    if (connector.type === 'INJECTED') {
      if (ConnectionController.checkInjectedInstalled()) {
        return { tagLabel: 'installed', tagVariant: 'shade' } as const
      }
    }

    return { tagLabel: undefined, tagVariant: undefined }
  }

  private onConnector(connector: Connector) {
    if (connector.type === 'WALLET_CONNECT') {
      if (CoreHelperUtil.isMobile()) {
        RouterController.push('AllWallets')
      } else {
        RouterController.push('ConnectingWalletConnect', { connector })
      }
    } else {
      RouterController.push('ConnectingExternal', { connector })
    }
  }

  private onAllWallets() {
    RouterController.push('AllWallets')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-view': W3mConnectView
  }
}
