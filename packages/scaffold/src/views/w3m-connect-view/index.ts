import type { Connector } from '@web3modal/core'
import {
  ApiController,
  AssetController,
  AssetUtil,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  StorageUtil
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  public static override styles = styles

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
        ${this.walletConnectConnectorTemplate()} ${this.recentTemplate()} ${this.featuredTemplate()}
        ${this.connectorsTemplate()} ${this.allWalletsTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private recentTemplate() {
    const recent = StorageUtil.getRecentWallets()

    return recent.map(
      wallet => html`
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet.image_id))}
          name=${wallet.name ?? 'Unknown'}
          @click=${() => RouterController.push('ConnectingWalletConnect', { wallet })}
          tagLabel="recent"
          tagVariant="shade"
        >
        </wui-list-wallet>
      `
    )
  }

  private featuredTemplate() {
    const { featured } = ApiController.state

    if (!featured.length) {
      return null
    }

    const recent = StorageUtil.getRecentWallets()
    const recentIds = recent.map(wallet => wallet.id)
    const featuredWallets = featured.filter(wallet => !recentIds.includes(wallet.id))

    return featuredWallets.map(
      wallet => html`
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet.image_id))}
          name=${wallet.name ?? 'Unknown'}
          @click=${() => RouterController.push('ConnectingWalletConnect', { wallet })}
        >
        </wui-list-wallet>
      `
    )
  }

  private walletConnectConnectorTemplate() {
    const connector = this.connectors.find(c => c.type === 'WALLET_CONNECT')
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
  }

  private connectorsTemplate() {
    return this.connectors.map(connector => {
      if (connector.type === 'WALLET_CONNECT') {
        return null
      }
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

  private allWalletsTemplate() {
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
        return { tagLabel: 'installed', tagVariant: 'success' } as const
      }
    }

    return { tagLabel: undefined, tagVariant: undefined }
  }

  private onConnector(connector: Connector) {
    if (connector.type === 'WALLET_CONNECT') {
      if (CoreHelperUtil.isMobile()) {
        RouterController.push('AllWallets')
      } else {
        RouterController.push('ConnectingWalletConnect')
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
