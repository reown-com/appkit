import type { Connector, WcWallet } from '@web3modal/core'
import {
  ApiController,
  AssetUtil,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  OptionsController,
  RouterController,
  StorageUtil
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ref, createRef } from 'lit/directives/ref.js'
import type { Ref } from 'lit/directives/ref.js'
import styles from './styles.js'

@customElement('w3m-connect-view')
export class W3mConnectView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private formRef: Ref<HTMLFormElement> = createRef()

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  @state() private email = ''

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override firstUpdated() {
    this.formRef.value?.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.onSubmitEmail(event)
      }
    })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="xs">
        ${this.emailConnectorTemplate()} ${this.walletConnectConnectorTemplate()}
        ${this.recentTemplate()} ${this.announcedTemplate()} ${this.injectedTemplate()}
        ${this.featuredTemplate()} ${this.customTemplate()} ${this.recommendedTemplate()}
        ${this.connectorsTemplate()} ${this.allWalletsTemplate()}
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `
  }

  // -- Private ------------------------------------------- //
  private emailConnectorTemplate() {
    const connector = this.connectors.find(c => c.type === 'EMAIL')

    if (!connector) {
      return null
    }

    return html`
      <form ${ref(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
        <wui-email-input @inputChange=${this.onEmailInputChange.bind(this)}></wui-email-input>
        <input type="submit" hidden />
      </form>
      <wui-separator text="or"></wui-separator>
    `
  }

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
        imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
        name=${connector.name ?? 'Unknown'}
        @click=${() => this.onConnector(connector)}
        tagLabel="qr code"
        tagVariant="main"
      >
      </wui-list-wallet>
    `
  }

  private customTemplate() {
    const { customWallets } = OptionsController.state
    if (!customWallets?.length) {
      return null
    }
    const wallets = this.filterOutDuplicateWallets(customWallets)

    return wallets.map(
      wallet => html`
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
          name=${wallet.name ?? 'Unknown'}
          @click=${() => this.onConnectWallet(wallet)}
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
    const wallets = this.filterOutDuplicateWallets(featured)

    return wallets.map(
      wallet => html`
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
          name=${wallet.name ?? 'Unknown'}
          @click=${() => this.onConnectWallet(wallet)}
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
          imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
          name=${wallet.name ?? 'Unknown'}
          @click=${() => this.onConnectWallet(wallet)}
          tagLabel="recent"
          tagVariant="shade"
        >
        </wui-list-wallet>
      `
    )
  }

  private announcedTemplate() {
    return this.connectors.map(connector => {
      if (connector.type !== 'ANNOUNCED') {
        return null
      }

      return html`
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
          name=${connector.name ?? 'Unknown'}
          @click=${() => this.onConnector(connector)}
          tagLabel="installed"
          tagVariant="success"
        >
        </wui-list-wallet>
      `
    })
  }

  private injectedTemplate() {
    const announced = this.connectors.find(c => c.type === 'ANNOUNCED')

    return this.connectors.map(connector => {
      if (connector.type !== 'INJECTED') {
        return null
      }
      if (!ConnectionController.checkInstalled()) {
        return null
      }

      return html`
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
          name=${connector.name ?? 'Unknown'}
          @click=${() => this.onConnector(connector)}
          tagLabel=${ifDefined(announced ? undefined : 'installed')}
          tagVariant=${ifDefined(announced ? undefined : 'success')}
        >
        </wui-list-wallet>
      `
    })
  }

  private connectorsTemplate() {
    return this.connectors.map(connector => {
      if (['WALLET_CONNECT', 'INJECTED', 'ANNOUNCED', 'EMAIL'].includes(connector.type)) {
        return null
      }

      return html`
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getConnectorImage(connector))}
          name=${connector.name ?? 'Unknown'}
          @click=${() => this.onConnector(connector)}
        >
        </wui-list-wallet>
      `
    })
  }

  private allWalletsTemplate() {
    const roundedCount = Math.floor(ApiController.state.count / 10) * 10

    return html`
      <wui-list-wallet
        name="All Wallets"
        walletIcon="allWallets"
        showAllWallets
        @click=${this.onAllWallets.bind(this)}
        tagLabel=${`${roundedCount}+`}
        tagVariant="shade"
      ></wui-list-wallet>
    `
  }

  private recommendedTemplate() {
    const { recommended } = ApiController.state
    const { customWallets, featuredWalletIds } = OptionsController.state
    const { connectors } = ConnectorController.state
    const recent = StorageUtil.getRecentWallets()
    const eip6963 = connectors.filter(c => c.type === 'ANNOUNCED')
    if (featuredWalletIds || customWallets || !recommended.length) {
      return null
    }

    const overrideLength = eip6963.length + recent.length
    const maxRecommended = Math.max(0, 2 - overrideLength)
    const wallets = this.filterOutDuplicateWallets(recommended).slice(0, maxRecommended)

    return wallets.map(
      wallet => html`
        <wui-list-wallet
          imageSrc=${ifDefined(AssetUtil.getWalletImage(wallet))}
          name=${wallet?.name ?? 'Unknown'}
          @click=${() => this.onConnectWallet(wallet)}
        >
        </wui-list-wallet>
      `
    )
  }

  // -- Private Methods ----------------------------------- //
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

  private filterOutDuplicateWallets(wallets: WcWallet[]) {
    const { connectors } = ConnectorController.state
    const recent = StorageUtil.getRecentWallets()
    const recentIds = recent.map(wallet => wallet.id)
    const rdnsIds = connectors.map(c => c.info?.rdns).filter(Boolean)
    const filtered = wallets.filter(
      wallet => !recentIds.includes(wallet.id) && !rdnsIds.includes(wallet.rdns ?? undefined)
    )

    return filtered
  }

  private onAllWallets() {
    EventsController.sendEvent({ type: 'track', event: 'CLICK_ALL_WALLETS' })
    RouterController.push('AllWallets')
  }

  private onConnectWallet(wallet: WcWallet) {
    RouterController.push('ConnectingWalletConnect', { wallet })
  }

  private onEmailInputChange(event: CustomEvent) {
    this.email = event.detail
  }

  private async onSubmitEmail(event: Event) {
    try {
      event.preventDefault()
      const emailConnector = ConnectorController.state.connectors.find(c => c.type === 'EMAIL')
      if (emailConnector?.provider) {
        // @ts-expect-error - Exists on email provider
        await emailConnector.provider.connectEmail(this.email)
      }
    } catch {
      console.error('error')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-view': W3mConnectView
  }
}
