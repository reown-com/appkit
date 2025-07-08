import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { type ChainNamespace, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  AccountController,
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
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-button'
import '@reown/appkit-ui/wui-tabs'
import '@reown/appkit-ui/wui-tooltip'
import '@reown/appkit-ui/wui-wallet-switch'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import { ConnectorUtil } from '../../utils/ConnectorUtil.js'
import { HelpersUtil } from '../../utils/HelpersUtil.js'
import '../w3m-account-activity-widget/index.js'
import '../w3m-account-nfts-widget/index.js'
import '../w3m-account-tokens-widget/index.js'
import '../w3m-tooltip-trigger/index.js'
import '../w3m-tooltip/index.js'
import styles from './styles.js'

const TABS_PADDING = 48
const MODAL_MOBILE_VIEW_PX = 430

@customElement('w3m-account-wallet-features-widget')
export class W3mAccountWalletFeaturesWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  @state() private watchTokenBalance?: ReturnType<typeof setInterval>

  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private address = AccountController.state.address

  @state() private profileName = AccountController.state.profileName

  @state() private network = ChainController.state.activeCaipNetwork

  @state() private currentTab = AccountController.state.currentTab

  @state() private tokenBalance = AccountController.state.tokenBalance

  @state() private features = OptionsController.state.features

  @state() private namespace = ChainController.state.activeChain

  @state() private activeConnectorIds = ConnectorController.state.activeConnectorIds

  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribe(val => {
          if (val.address) {
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

  public override firstUpdated() {
    AccountController.fetchTokenBalance()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.address) {
      throw new Error('w3m-account-view: No account provided')
    }

    if (!this.namespace) {
      return null
    }

    const connectorId = this.activeConnectorIds[this.namespace]

    const connector = connectorId ? ConnectorController.getConnectorById(connectorId) : undefined

    const { icon, iconSize } = this.getAuthData()

    return html`<wui-flex
      flexDirection="column"
      .padding=${['0', 'xl', 'm', 'xl'] as const}
      alignItems="center"
      gap="m"
      data-testid="w3m-account-wallet-features-widget"
    >
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center" gap="xs">
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

    return html`<wui-flex gap="s">
      ${walletFeaturesOrder.map(feature => {
        switch (feature) {
          case 'onramp':
            return this.onrampTemplate()
          case 'swaps':
            return this.swapsTemplate()
          case 'receive':
            return this.receiveTemplate()
          case 'send':
            return this.sendTemplate()
          default:
            return null
        }
      })}
    </wui-flex>`
  }

  private onrampTemplate() {
    const isOnrampEnabled = this.remoteFeatures?.onramp

    if (!isOnrampEnabled) {
      return null
    }

    return html`
      <w3m-tooltip-trigger text="Buy">
        <wui-icon-button
          data-testid="wallet-features-onramp-button"
          @click=${this.onBuyClick.bind(this)}
          icon="card"
        ></wui-icon-button>
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
        <wui-icon-button
          data-testid="wallet-features-swaps-button"
          @click=${this.onSwapClick.bind(this)}
          icon="recycleHorizontal"
        >
        </wui-icon-button>
      </w3m-tooltip-trigger>
    `
  }

  private receiveTemplate() {
    const isReceiveEnabled = this.features?.receive

    if (!isReceiveEnabled) {
      return null
    }

    return html`
      <w3m-tooltip-trigger text="Receive">
        <wui-icon-button
          data-testid="wallet-features-receive-button"
          @click=${this.onReceiveClick.bind(this)}
          icon="arrowBottomCircle"
        >
        </wui-icon-button>
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
        <wui-icon-button
          data-testid="wallet-features-send-button"
          @click=${this.onSendClick.bind(this)}
          icon="send"
        ></wui-icon-button>
      </w3m-tooltip-trigger>
    `
  }

  private watchSwapValues() {
    this.watchTokenBalance = setInterval(
      () => AccountController.fetchTokenBalance(error => this.onTokenBalanceError(error)),
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
      return html`<w3m-account-nfts-widget></w3m-account-nfts-widget>`
    }
    if (this.currentTab === 2) {
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

    const isMobileAndSmall = CoreHelperUtil.isMobile() && window.innerWidth < MODAL_MOBILE_VIEW_PX
    let localTabWidth = '104px'

    if (isMobileAndSmall) {
      localTabWidth = `${(window.innerWidth - TABS_PADDING) / tabsByNamespace.length}px`
    } else if (tabsByNamespace.length === 2) {
      localTabWidth = '156px'
    } else {
      localTabWidth = '104px'
    }

    return html`<wui-tabs
      .onTabChange=${this.onTabChange.bind(this)}
      .activeTab=${this.currentTab}
      localTabWidth=${localTabWidth}
      .tabs=${tabsByNamespace}
    ></wui-tabs>`
  }

  private onTabChange(index: number) {
    AccountController.setCurrentTab(index)
  }

  private onBuyClick() {
    RouterController.push('OnRampProviders')
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

  private onReceiveClick() {
    RouterController.push('WalletReceive')
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
