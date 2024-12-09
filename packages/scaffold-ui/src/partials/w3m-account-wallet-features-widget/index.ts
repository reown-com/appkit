import {
  AccountController,
  ModalController,
  AssetUtil,
  RouterController,
  CoreHelperUtil,
  ConstantsUtil as CoreConstantsUtil,
  EventsController,
  OptionsController,
  ChainController
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'
import { ConstantsUtil } from '../../utils/ConstantsUtil.js'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet'

const TABS = 3
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

  @state() private profileImage = AccountController.state.profileImage

  @state() private profileName = AccountController.state.profileName

  @state() private network = ChainController.state.activeCaipNetwork

  @state() private currentTab = AccountController.state.currentTab

  @state() private tokenBalance = AccountController.state.tokenBalance

  @state() private features = OptionsController.state.features

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribe(val => {
          if (val.address) {
            this.address = val.address
            this.profileImage = val.profileImage
            this.profileName = val.profileName
            this.currentTab = val.currentTab
            this.tokenBalance = val.tokenBalance
          } else {
            ModalController.close()
          }
        })
      ],
      ChainController.subscribeKey('activeCaipNetwork', val => (this.network = val)),
      OptionsController.subscribeKey('features', val => (this.features = val))
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

    const networkImage = AssetUtil.getNetworkImage(this.network)

    return html`<wui-flex
      flexDirection="column"
      .padding=${['0', 'xl', 'm', 'xl'] as const}
      alignItems="center"
      gap="m"
      data-testid="w3m-account-wallet-features-widget"
    >
      ${this.network && html`<wui-network-icon .network=${this.network}></wui-network-icon>`}
      <wui-profile-button
        @click=${this.onProfileButtonClick.bind(this)}
        address=${ifDefined(this.address)}
        networkSrc=${ifDefined(networkImage)}
        icon="chevronBottom"
        avatarSrc=${ifDefined(this.profileImage ? this.profileImage : undefined)}
        profileName=${ifDefined(this.profileName ?? undefined)}
        data-testid="w3m-profile-button"
      ></wui-profile-button>

      ${this.tokenBalanceTemplate()} ${this.orderedWalletFeatures()}

      <wui-tabs
        .onTabChange=${this.onTabChange.bind(this)}
        .activeTab=${this.currentTab}
        localTabWidth=${CoreHelperUtil.isMobile() && window.innerWidth < MODAL_MOBILE_VIEW_PX
          ? `${(window.innerWidth - TABS_PADDING) / TABS}px`
          : '104px'}
        .tabs=${ConstantsUtil.ACCOUNT_TABS}
      ></wui-tabs>
      ${this.listContentTemplate()}
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private orderedWalletFeatures() {
    const walletFeaturesOrder =
      this.features?.walletFeaturesOrder || CoreConstantsUtil.DEFAULT_FEATURES.walletFeaturesOrder
    const isAllDisabled = walletFeaturesOrder.every(feature => !this.features?.[feature])

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
    const onramp = this.features?.onramp

    if (!onramp) {
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
    const swaps = this.features?.swaps
    const isEvm = ChainController.state.activeChain === CommonConstantsUtil.CHAIN.EVM

    if (!swaps || !isEvm) {
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
    const receive = this.features?.receive

    if (!receive) {
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
    const send = this.features?.send
    const isEvm = ChainController.state.activeChain === CommonConstantsUtil.CHAIN.EVM

    if (!send || !isEvm) {
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
    this.watchTokenBalance = setInterval(() => AccountController.fetchTokenBalance(), 10000)
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

  private onTabChange(index: number) {
    AccountController.setCurrentTab(index)
  }

  private onProfileButtonClick() {
    RouterController.push('Profile')
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
            AccountController.state.preferredAccountType ===
            W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
        }
      })
      RouterController.push('Swap')
    }
  }

  private onReceiveClick() {
    RouterController.push('WalletReceive')
  }

  private onSendClick() {
    EventsController.sendEvent({
      type: 'track',
      event: 'OPEN_SEND',
      properties: {
        network: this.network?.caipNetworkId || '',
        isSmartAccount:
          AccountController.state.preferredAccountType ===
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
