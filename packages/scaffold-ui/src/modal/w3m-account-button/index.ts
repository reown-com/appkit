import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import {
  AccountController,
  AssetController,
  AssetUtil,
  ChainController,
  CoreHelperUtil,
  ModalController,
  OptionsController
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import type { WuiAccountButton } from '@reown/appkit-ui/wui-account-button'
import '@reown/appkit-ui/wui-account-button'

class W3mAccountButtonBase extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled?: WuiAccountButton['disabled'] = false

  @property() public balance?: 'show' | 'hide' = 'show'

  @property() public charsStart?: WuiAccountButton['charsStart'] = 4

  @property() public charsEnd?: WuiAccountButton['charsEnd'] = 6

  @property() public namespace?: ChainNamespace = undefined

  @state() private caipAddress = ChainController.getAccountData(this.namespace)?.caipAddress

  @state() private balanceVal = ChainController.getAccountData(this.namespace)?.balance

  @state() private balanceSymbol = ChainController.getAccountData(this.namespace)?.balanceSymbol

  @state() private profileName = ChainController.getAccountData(this.namespace)?.profileName

  @state() private profileImage = ChainController.getAccountData(this.namespace)?.profileImage

  @state() private network = ChainController.getNetworkData(this.namespace)?.caipNetwork

  @state() private networkImage = AssetUtil.getNetworkImage(this.network)

  // eslint-disable-next-line no-nested-ternary
  @state() private isSupported = OptionsController.state.allowUnsupportedChain
    ? true
    : ChainController.state.activeChain
      ? ChainController.checkIfSupportedNetwork(ChainController.state.activeChain)
      : true

  // -- Lifecycle ----------------------------------------- //
  public override firstUpdated() {
    const namespace = this.namespace

    if (namespace) {
      this.unsubscribe.push(
        ChainController.subscribeChainProp(
          'accountState',
          val => {
            this.caipAddress = val?.caipAddress
            this.balanceVal = val?.balance
            this.balanceSymbol = val?.balanceSymbol
            this.profileName = val?.profileName
            this.profileImage = val?.profileImage
          },
          namespace
        ),
        ChainController.subscribeChainProp(
          'networkState',
          val => {
            this.network = val?.caipNetwork
            this.isSupported = ChainController.checkIfSupportedNetwork(namespace, val?.caipNetwork)
            this.networkImage = AssetUtil.getNetworkImage(val?.caipNetwork)
          },
          namespace
        )
      )
    } else {
      this.unsubscribe.push(
        AssetController.subscribeNetworkImages(() => {
          this.networkImage = AssetUtil.getNetworkImage(this.network)
        }),
        ChainController.subscribeKey('activeCaipAddress', val => {
          this.caipAddress = val
        }),
        AccountController.subscribeKey('balance', val => (this.balanceVal = val)),
        AccountController.subscribeKey('balanceSymbol', val => (this.balanceSymbol = val)),
        AccountController.subscribeKey('profileName', val => (this.profileName = val)),
        AccountController.subscribeKey('profileImage', val => (this.profileImage = val)),
        ChainController.subscribeKey('activeCaipNetwork', val => {
          this.network = val
          this.networkImage = AssetUtil.getNetworkImage(val)
          this.isSupported = val?.chainNamespace
            ? ChainController.checkIfSupportedNetwork(val?.chainNamespace)
            : true
          this.fetchNetworkImage(val)
        })
      )
    }
  }

  public override updated() {
    this.fetchNetworkImage(this.network)
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!ChainController.state.activeChain) {
      return null
    }

    const shouldShowBalance = this.balance === 'show'
    const shouldShowLoading = typeof this.balanceVal !== 'string'

    return html`
      <wui-account-button
        .disabled=${Boolean(this.disabled)}
        .isUnsupportedChain=${OptionsController.state.allowUnsupportedChain
          ? false
          : !this.isSupported}
        address=${ifDefined(CoreHelperUtil.getPlainAddress(this.caipAddress))}
        profileName=${ifDefined(this.profileName)}
        networkSrc=${ifDefined(this.networkImage)}
        avatarSrc=${ifDefined(this.profileImage)}
        balance=${shouldShowBalance
          ? CoreHelperUtil.formatBalance(this.balanceVal, this.balanceSymbol)
          : ''}
        @click=${this.onClick.bind(this)}
        data-testid=${`account-button${this.namespace ? `-${this.namespace}` : ''}`}
        .charsStart=${this.charsStart}
        .charsEnd=${this.charsEnd}
        ?loading=${shouldShowLoading}
      >
      </wui-account-button>
    `
  }

  // -- Private ------------------------------------------- //
  private async onClick() {
    const isDifferentChain = this.namespace !== ChainController.state.activeChain
    const caipNetworkOfNamespace = ChainController.getNetworkData(this.namespace)?.caipNetwork
    const firstNetworkWithChain = ChainController.getCaipNetworkByNamespace(
      this.namespace,
      caipNetworkOfNamespace?.id
    )

    if (isDifferentChain && firstNetworkWithChain) {
      await ChainController.switchActiveNetwork(firstNetworkWithChain)
    }

    if (this.isSupported || OptionsController.state.allowUnsupportedChain) {
      ModalController.open()
    } else {
      ModalController.open({ view: 'UnsupportedChain' })
    }
  }

  private async fetchNetworkImage(network?: CaipNetwork) {
    if (network?.assets?.imageId) {
      this.networkImage = await AssetUtil.fetchNetworkImage(network?.assets?.imageId)
    }
  }
}

@customElement('w3m-account-button')
export class W3mAccountButton extends W3mAccountButtonBase {}

@customElement('appkit-account-button')
export class AppKitAccountButton extends W3mAccountButtonBase {}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-button': W3mAccountButton
    'appkit-account-button': AppKitAccountButton
  }
}
