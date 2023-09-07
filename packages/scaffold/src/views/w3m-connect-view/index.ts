import type { ApiWallet, Connector } from '@web3modal/core'
import {
  ApiController,
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
        ${this.recommendedMobileTemplate()} ${this.connectorsTemplate()}
        ${this.allWalletsTemplate()}
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `
  }

  // -- Private ------------------------------------------- //
  private walletConnectConnectorTemplate() {
    if (CoreHelperUtil.isMobile()) {
      return null
    }
    const connector = this.connectors.find(c => c.type === 'WALLET_CONNECT')
    if (!connector) {
      return null
    }

    return html`
      <wui-list-wallet
        imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector.imageId))}
        name=${connector.name ?? 'Unknown'}
        @click=${() => this.onConnector(connector)}
        tagLabel="qr code"
        tagVariant="main"
      >
      </wui-list-wallet>
    `
  }

  private featuredTemplate() {
    const { featured } = ApiController.state
    if (!featured.length) {
      return null
    }
    const wallets = this.filterOutRecentWallets(featured)

    return wallets.map(
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

  private connectorsTemplate() {
    return this.connectors.map(connector => {
      if (connector.type === 'WALLET_CONNECT') {
        return null
      }
      const { tagLabel, tagVariant } = this.getTag(connector)

      if (connector.type === 'INJECTED' && tagLabel !== 'installed') {
        return null
      }

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
    return html`
      <wui-list-wallet
        name="All Wallets"
        walletIcon="allWallets"
        showAllWallets
        @click=${() => RouterController.push('AllWallets')}
        tagLabel=${`${ApiController.state.count}+`}
        tagVariant="shade"
      ></wui-list-wallet>
    `
  }

  private recommendedMobileTemplate() {
    if (!CoreHelperUtil.isMobile()) {
      return null
    }
    const { recommended } = ApiController.state
    if (!recommended.length) {
      return null
    }
    const [first, second] = this.filterOutRecentWallets(recommended)

    return [first, second].map(
      wallet => html`
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet?.image_id))}
          name=${wallet?.name ?? 'Unknown'}
          @click=${() => RouterController.push('ConnectingWalletConnect', { wallet })}
        >
        </wui-list-wallet>
      `
    )
  }

  private getTag(connector: Connector) {
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

  private filterOutRecentWallets(wallets: ApiWallet[]) {
    const recent = StorageUtil.getRecentWallets()
    const recentIds = recent.map(wallet => wallet.id)
    const filteredWallets = wallets.filter(
      wallet => !recentIds.includes(wallet.id) && wallet.mobile_link?.length
    )

    return filteredWallets
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-view': W3mConnectView
  }
}
