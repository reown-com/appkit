import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil } from '@reown/appkit-common'
import {
  AccountController,
  AssetUtil,
  ChainController,
  ConnectionController,
  ConnectorController,
  ConstantsUtil as CoreConstantsUtil,
  CoreHelperUtil,
  EventsController,
  OptionsController,
  RouterController,
  SnackController,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-avatar'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-link'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-notice-card'
import '@reown/appkit-ui/wui-profile-button-v2'
import '@reown/appkit-ui/wui-tabs'
import '@reown/appkit-ui/wui-tag'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-wallet-switch'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import '../w3m-account-auth-button/index.js'
import styles from './styles.js'

@customElement('w3m-account-default-widget')
export class W3mAccountDefaultWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public caipAddress = AccountController.state.caipAddress

  @state() public address = CoreHelperUtil.getPlainAddress(AccountController.state.caipAddress)

  @state() private profileImage = AccountController.state.profileImage

  @state() private profileName = AccountController.state.profileName

  @state() private disconnecting = false

  @state() private balance = AccountController.state.balance

  @state() private balanceSymbol = AccountController.state.balanceSymbol

  @state() private features = OptionsController.state.features

  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  @state() private namespace = ChainController.state.activeChain

  @state() private activeConnectorIds = ConnectorController.state.activeConnectorIds

  public constructor() {
    super()

    this.unsubscribe.push(
      ...[
        AccountController.subscribeKey('caipAddress', val => {
          this.address = CoreHelperUtil.getPlainAddress(val)
          this.caipAddress = val
        }),
        AccountController.subscribeKey('balance', val => (this.balance = val)),
        AccountController.subscribeKey('balanceSymbol', val => (this.balanceSymbol = val)),
        AccountController.subscribeKey('profileName', val => (this.profileName = val)),
        AccountController.subscribeKey('profileImage', val => (this.profileImage = val)),
        OptionsController.subscribeKey('features', val => (this.features = val)),
        OptionsController.subscribeKey('remoteFeatures', val => (this.remoteFeatures = val)),
        ConnectorController.subscribeKey('activeConnectorIds', newActiveConnectorIds => {
          this.activeConnectorIds = newActiveConnectorIds
        }),
        ChainController.subscribeKey('activeChain', val => (this.namespace = val)),
        ChainController.subscribeKey('activeCaipNetwork', val => {
          if (val?.chainNamespace) {
            this.namespace = val?.chainNamespace
          }
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.caipAddress || !this.namespace) {
      return null
    }

    const connectorId = this.activeConnectorIds[this.namespace]

    const connector = connectorId ? ConnectorController.getConnectorById(connectorId) : undefined
    const connectorImage = AssetUtil.getConnectorImage(connector)

    return html`<wui-flex
        flexDirection="column"
        .padding=${['0', 'xl', 'm', 'xl'] as const}
        alignItems="center"
        gap="s"
      >
        <wui-avatar
          alt=${ifDefined(this.caipAddress)}
          address=${ifDefined(CoreHelperUtil.getPlainAddress(this.caipAddress))}
          imageSrc=${ifDefined(this.profileImage === null ? undefined : this.profileImage)}
          data-testid="single-account-avatar"
        ></wui-avatar>
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${this.address}
          imageSrc=${connectorImage}
          alt=${connector?.name}
          @click=${this.onGoToProfileWalletsView.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>
        <wui-flex flexDirection="column" alignItems="center">
          <wui-text variant="paragraph-500" color="fg-200">
            ${CoreHelperUtil.formatBalance(this.balance, this.balanceSymbol)}
          </wui-text>
        </wui-flex>
        ${this.explorerBtnTemplate()}
      </wui-flex>

      <wui-flex flexDirection="column" gap="xs" .padding=${['0', 's', 's', 's'] as const}>
        ${this.authCardTemplate()} <w3m-account-auth-button></w3m-account-auth-button>
        ${this.orderedFeaturesTemplate()} ${this.activityTemplate()}
        <wui-list-item
          variant="icon"
          iconVariant="overlay"
          icon="disconnect"
          ?chevron=${false}
          .loading=${this.disconnecting}
          @click=${this.onDisconnect.bind(this)}
          data-testid="disconnect-button"
        >
          <wui-text variant="paragraph-500" color="fg-200">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private onrampTemplate() {
    if (!this.namespace) {
      return null
    }

    const isOnrampEnabled = this.remoteFeatures?.onramp
    const hasNetworkSupport = CoreConstantsUtil.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(
      this.namespace
    )

    if (!isOnrampEnabled || !hasNetworkSupport) {
      return null
    }

    return html`
      <wui-list-item
        data-testid="w3m-account-default-onramp-button"
        iconVariant="blue"
        icon="card"
        ?chevron=${true}
        @click=${this.handleClickPay.bind(this)}
      >
        <wui-text variant="paragraph-500" color="fg-100">Buy crypto</wui-text>
      </wui-list-item>
    `
  }

  private orderedFeaturesTemplate() {
    const featuresOrder =
      this.features?.walletFeaturesOrder || CoreConstantsUtil.DEFAULT_FEATURES.walletFeaturesOrder

    return featuresOrder.map(feature => {
      switch (feature) {
        case 'onramp':
          return this.onrampTemplate()
        case 'swaps':
          return this.swapsTemplate()
        case 'send':
          return this.sendTemplate()
        default:
          return null
      }
    })
  }

  private activityTemplate() {
    if (!this.namespace) {
      return null
    }

    const isEnabled =
      this.remoteFeatures?.activity &&
      CoreConstantsUtil.ACTIVITY_ENABLED_CHAIN_NAMESPACES.includes(this.namespace)

    return isEnabled
      ? html` <wui-list-item
          iconVariant="blue"
          icon="clock"
          iconSize="sm"
          ?chevron=${true}
          @click=${this.onTransactions.bind(this)}
          data-testid="w3m-account-default-activity-button"
        >
          <wui-text variant="paragraph-500" color="fg-100">Activity</wui-text>
        </wui-list-item>`
      : null
  }

  private swapsTemplate() {
    const isSwapsEnabled = this.remoteFeatures?.swaps
    const isEvm = ChainController.state.activeChain === ConstantsUtil.CHAIN.EVM

    if (!isSwapsEnabled || !isEvm) {
      return null
    }

    return html`
      <wui-list-item
        iconVariant="blue"
        icon="recycleHorizontal"
        ?chevron=${true}
        @click=${this.handleClickSwap.bind(this)}
        data-testid="w3m-account-default-swaps-button"
      >
        <wui-text variant="paragraph-500" color="fg-100">Swap</wui-text>
      </wui-list-item>
    `
  }

  private sendTemplate() {
    const isSendEnabled = this.features?.send
    const namespace = ChainController.state.activeChain

    if (!namespace) {
      throw new Error('SendController:sendTemplate - namespace is required')
    }

    const isSendSupported = CoreConstantsUtil.SEND_SUPPORTED_NAMESPACES.includes(namespace)

    if (!isSendEnabled || !isSendSupported) {
      return null
    }

    return html`
      <wui-list-item
        iconVariant="blue"
        icon="send"
        ?chevron=${true}
        @click=${this.handleClickSend.bind(this)}
        data-testid="w3m-account-default-send-button"
      >
        <wui-text variant="paragraph-500" color="fg-100">Send</wui-text>
      </wui-list-item>
    `
  }

  private authCardTemplate() {
    const namespace = ChainController.state.activeChain

    if (!namespace) {
      throw new Error('AuthCardTemplate:authCardTemplate - namespace is required')
    }

    const connectorId = ConnectorController.getConnectorId(namespace)
    const authConnector = ConnectorController.getAuthConnector()
    const { origin } = location

    if (
      !authConnector ||
      connectorId !== ConstantsUtil.CONNECTOR_ID.AUTH ||
      origin.includes(CoreConstantsUtil.SECURE_SITE)
    ) {
      return null
    }

    return html`
      <wui-notice-card
        @click=${this.onGoToUpgradeView.bind(this)}
        label="Upgrade your wallet"
        description="Transition to a self-custodial wallet"
        icon="wallet"
        data-testid="w3m-wallet-upgrade-card"
      ></wui-notice-card>
    `
  }

  private handleClickPay() {
    RouterController.push('OnRampProviders')
  }

  private handleClickSwap() {
    RouterController.push('Swap')
  }

  private handleClickSend() {
    RouterController.push('WalletSend')
  }

  private explorerBtnTemplate() {
    const addressExplorerUrl = AccountController.state.addressExplorerUrl

    if (!addressExplorerUrl) {
      return null
    }

    return html`
      <wui-button size="md" variant="neutral" @click=${this.onExplorer.bind(this)}>
        <wui-icon size="sm" color="inherit" slot="iconLeft" name="compass"></wui-icon>
        Block Explorer
        <wui-icon size="sm" color="inherit" slot="iconRight" name="externalLink"></wui-icon>
      </wui-button>
    `
  }

  private onTransactions() {
    EventsController.sendEvent({
      type: 'track',
      event: 'CLICK_TRANSACTIONS',
      properties: {
        isSmartAccount:
          getPreferredAccountType(ChainController.state.activeChain) ===
          W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
      }
    })
    RouterController.push('Transactions')
  }

  private async onDisconnect() {
    try {
      this.disconnecting = true
      const connectionsByNamespace = ConnectionController.getConnections(this.namespace)
      const hasConnections = connectionsByNamespace.length > 0
      const connectorId =
        this.namespace && ConnectorController.state.activeConnectorIds[this.namespace]
      const isMultiWalletEnabled = this.remoteFeatures?.multiWallet
      await ConnectionController.disconnect(
        isMultiWalletEnabled ? { id: connectorId, namespace: this.namespace } : {}
      )
      if (hasConnections && isMultiWalletEnabled) {
        RouterController.push('ProfileWallets')
        SnackController.showSuccess('Wallet deleted')
      }
    } catch {
      EventsController.sendEvent({ type: 'track', event: 'DISCONNECT_ERROR' })
      SnackController.showError('Failed to disconnect')
    } finally {
      this.disconnecting = false
    }
  }

  private onExplorer() {
    const addressExplorerUrl = AccountController.state.addressExplorerUrl

    if (addressExplorerUrl) {
      CoreHelperUtil.openHref(addressExplorerUrl, '_blank')
    }
  }

  private onGoToUpgradeView() {
    EventsController.sendEvent({ type: 'track', event: 'EMAIL_UPGRADE_FROM_MODAL' })
    RouterController.push('UpgradeEmailWallet')
  }

  private onGoToProfileWalletsView() {
    RouterController.push('ProfileWallets')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-default-widget': W3mAccountDefaultWidget
  }
}
