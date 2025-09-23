import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { type ChainNamespace, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectorController,
  ConstantsUtil as CoreConstantsUtil,
  CoreHelperUtil,
  EventsController,
  ModalController,
  OptionsController,
  RouterController,
  type SocialProvider,
  StorageUtil,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-balance'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-tabs'
import '@reown/appkit-ui/wui-tooltip'
import '@reown/appkit-ui/wui-wallet-switch'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { ConnectorUtil } from '../../utils/ConnectorUtil.js'
import { HelpersUtil } from '../../utils/HelpersUtil.js'
import '../w3m-account-activity-widget/index.js'
import '../w3m-account-tokens-widget/index.js'
import '../w3m-tooltip-trigger/index.js'
import '../w3m-tooltip/index.js'
import styles from './styles.js'

@customElement('w3m-account-wallet-features-widget')
export class W3mAccountWalletFeaturesWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  @state() private watchTokenBalance?: ReturnType<typeof setInterval>

  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private network = ChainController.state.activeCaipNetwork

  @state() private profileName = ChainController.getAccountData()?.profileName

  @state() private address = ChainController.getAccountData()?.address

  @state() private currentTab = ChainController.getAccountData()?.currentTab

  @state() private tokenBalance = ChainController.getAccountData()?.tokenBalance

  @state() private features = OptionsController.state.features

  @state() private namespace = ChainController.state.activeChain

  @state() private activeConnectorIds = ConnectorController.state.activeConnectorIds

  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  public override firstUpdated() {
    ChainController.fetchTokenBalance()
    this.unsubscribe.push(
      ...[
        ChainController.subscribeChainProp('accountState', val => {
          if (val?.address) {
            this.address = val.address
            this.profileName = val.profileName
            this.currentTab = val.currentTab
            this.tokenBalance = val.tokenBalance
          } else {
            ModalController.close()
          }
        })
      ],

      ConnectorController.subscribeKey('activeConnectorIds', newActiveConnectorIds => {
        this.activeConnectorIds = newActiveConnectorIds
      }),
      ChainController.subscribeKey('activeChain', val => (this.namespace = val)),
      ChainController.subscribeKey('activeCaipNetwork', val => (this.network = val)),
      OptionsController.subscribeKey('features', val => (this.features = val)),
      OptionsController.subscribeKey('remoteFeatures', val => (this.remoteFeatures = val))
    )
    this.watchSwapValues()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    clearInterval(this.watchTokenBalance)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.address) {
      throw new Error('w3m-account-features-widget: No account provided')
    }

    if (!this.namespace) {
      return null
    }

    const connectorId = this.activeConnectorIds[this.namespace]

    const connector = connectorId ? ConnectorController.getConnectorById(connectorId) : undefined

    const { icon, iconSize } = this.getAuthData()

    return html`<wui-flex
      flexDirection="column"
      .padding=${['0', '3', '4', '3'] as const}
      alignItems="center"
      gap="4"
      data-testid="w3m-account-wallet-features-widget"
    >
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center" gap="2">
        <wui-wallet-switch
          profileName=${this.profileName}
          address=${this.address}
          icon=${icon}
          iconSize=${iconSize}
          alt=${connector?.name}
          @click=${this.onGoToProfileWalletsView.bind(this)}
          data-testid="wui-wallet-switch"
        ></wui-wallet-switch>

        ${this.tokenBalanceTemplate()}
      </wui-flex>
      ${this.orderedWalletFeatures()} ${this.tabsTemplate()} ${this.listContentTemplate()}
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private orderedWalletFeatures() {
    const walletFeaturesOrder =
      this.features?.walletFeaturesOrder || CoreConstantsUtil.DEFAULT_FEATURES.walletFeaturesOrder
    const isAllDisabled = walletFeaturesOrder.every(feature => {
      if (feature === 'send' || feature === 'receive') {
        return !this.features?.[feature]
      }
      if (feature === 'swaps' || feature === 'onramp') {
        return !this.remoteFeatures?.[feature]
      }

      return true
    })

    if (isAllDisabled) {
      return null
    }

    // Merge receive and onramp into fund to maintain backward compatibility for walletFeaturesOrder
    const mergedFeaturesOrder = walletFeaturesOrder.map(feature => {
      if (feature === 'receive' || feature === 'onramp') {
        return 'fund'
      }

      return feature
    })
    const deduplicatedFeaturesOrder = [...new Set(mergedFeaturesOrder)]

    return html`<wui-flex gap="2">
      ${deduplicatedFeaturesOrder.map(feature => {
        switch (feature) {
          case 'fund':
            return this.fundWalletTemplate()
          case 'swaps':
            return this.swapsTemplate()
          case 'send':
            return this.sendTemplate()
          default:
            return null
        }
      })}
    </wui-flex>`
  }

  private fundWalletTemplate() {
    if (!this.namespace) {
      return null
    }

    const isOnrampSupported = CoreConstantsUtil.ONRAMP_SUPPORTED_CHAIN_NAMESPACES.includes(
      this.namespace
    )
    const isPayWithExchangeSupported =
      CoreConstantsUtil.PAY_WITH_EXCHANGE_SUPPORTED_CHAIN_NAMESPACES.includes(this.namespace)

    const isReceiveEnabled = this.features?.receive
    const isOnrampEnabled = this.remoteFeatures?.onramp && isOnrampSupported
    const isPayWithExchangeEnabled =
      this.remoteFeatures?.payWithExchange && isPayWithExchangeSupported

    if (!isOnrampEnabled && !isReceiveEnabled && !isPayWithExchangeEnabled) {
      return null
    }

    return html`
      <w3m-tooltip-trigger text="Fund wallet">
        <wui-button
          data-testid="wallet-features-fund-wallet-button"
          @click=${this.onFundWalletClick.bind(this)}
          variant="accent-secondary"
          size="lg"
          fullWidth
        >
          <wui-icon name="dollar"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `
  }

  private swapsTemplate() {
    const isSwapsEnabled = this.remoteFeatures?.swaps
    const isEvm = ChainController.state.activeChain === CommonConstantsUtil.CHAIN.EVM

    if (!isSwapsEnabled || !isEvm) {
      return null
    }

    return html`
      <w3m-tooltip-trigger text="Swap">
        <wui-button
          fullWidth
          data-testid="wallet-features-swaps-button"
          @click=${this.onSwapClick.bind(this)}
          variant="accent-secondary"
          size="lg"
        >
          <wui-icon name="recycleHorizontal"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `
  }

  private sendTemplate() {
    const isSendEnabled = this.features?.send
    const activeNamespace = ChainController.state.activeChain as ChainNamespace
    const isSendSupported = CoreConstantsUtil.SEND_SUPPORTED_NAMESPACES.includes(activeNamespace)

    if (!isSendEnabled || !isSendSupported) {
      return null
    }

    return html`
      <w3m-tooltip-trigger text="Send">
        <wui-button
          fullWidth
          data-testid="wallet-features-send-button"
          @click=${this.onSendClick.bind(this)}
          variant="accent-secondary"
          size="lg"
        >
          <wui-icon name="send"></wui-icon>
        </wui-button>
      </w3m-tooltip-trigger>
    `
  }

  private watchSwapValues() {
    this.watchTokenBalance = setInterval(
      () => ChainController.fetchTokenBalance(error => this.onTokenBalanceError(error)),
      10_000
    )
  }

  private onTokenBalanceError(error: unknown) {
    if (error instanceof Error && error.cause instanceof Response) {
      const statusCode = error.cause.status

      if (statusCode === CommonConstantsUtil.HTTP_STATUS_CODES.SERVICE_UNAVAILABLE) {
        clearInterval(this.watchTokenBalance)
      }
    }
  }

  private listContentTemplate() {
    if (this.currentTab === 0) {
      return html`<w3m-account-tokens-widget></w3m-account-tokens-widget>`
    }
    if (this.currentTab === 1) {
      return html`<w3m-account-activity-widget></w3m-account-activity-widget>`
    }

    return html`<w3m-account-tokens-widget></w3m-account-tokens-widget>`
  }

  private tokenBalanceTemplate() {
    if (this.tokenBalance && this.tokenBalance?.length >= 0) {
      const value = CoreHelperUtil.calculateBalance(this.tokenBalance)
      const { dollars = '0', pennies = '00' } = CoreHelperUtil.formatTokenBalance(value)

      return html`<wui-balance dollars=${dollars} pennies=${pennies}></wui-balance>`
    }

    return html`<wui-balance dollars="0" pennies="00"></wui-balance>`
  }

  private tabsTemplate() {
    const tabsByNamespace = HelpersUtil.getTabsByNamespace(ChainController.state.activeChain)

    if (tabsByNamespace.length === 0) {
      return null
    }

    return html`<wui-tabs
      .onTabChange=${this.onTabChange.bind(this)}
      .activeTab=${this.currentTab}
      .tabs=${tabsByNamespace}
    ></wui-tabs>`
  }

  private onTabChange(index: number) {
    ChainController.setAccountProp('currentTab', index, this.namespace)
  }

  private onFundWalletClick() {
    RouterController.push('FundWallet')
  }

  private onSwapClick() {
    if (
      this.network?.caipNetworkId &&
      !CoreConstantsUtil.SWAP_SUPPORTED_NETWORKS.includes(this.network?.caipNetworkId)
    ) {
      RouterController.push('UnsupportedChain', {
        swapUnsupportedChain: true
      })
    } else {
      EventsController.sendEvent({
        type: 'track',
        event: 'OPEN_SWAP',
        properties: {
          network: this.network?.caipNetworkId || '',
          isSmartAccount:
            getPreferredAccountType(ChainController.state.activeChain) ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
        }
      })
      RouterController.push('Swap')
    }
  }

  private getAuthData() {
    const socialProvider = StorageUtil.getConnectedSocialProvider() as SocialProvider | null
    const socialUsername = StorageUtil.getConnectedSocialUsername() as string | null

    const authConnector = ConnectorController.getAuthConnector()
    const email = authConnector?.provider.getEmail() ?? ''

    return {
      name: ConnectorUtil.getAuthName({
        email,
        socialUsername,
        socialProvider
      }),
      icon: socialProvider ?? 'mail',
      iconSize: socialProvider ? 'xl' : 'md'
    }
  }

  private onGoToProfileWalletsView() {
    RouterController.push('ProfileWallets')
  }

  private onSendClick() {
    EventsController.sendEvent({
      type: 'track',
      event: 'OPEN_SEND',
      properties: {
        network: this.network?.caipNetworkId || '',
        isSmartAccount:
          getPreferredAccountType(ChainController.state.activeChain) ===
          W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
      }
    })
    RouterController.push('WalletSend')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-wallet-features-widget': W3mAccountWalletFeaturesWidget
  }
}
