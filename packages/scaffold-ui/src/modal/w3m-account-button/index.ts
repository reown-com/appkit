import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { AccountState, CaipAddress, CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import {
  AssetController,
  AssetUtil,
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  ModalController,
  type NamespaceState,
  OptionsController
} from '@reown/appkit-controllers'
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

  @state() private caipAddress: CaipAddress | undefined

  @state() private balanceVal: string | undefined

  @state() private balanceSymbol: string | undefined

  @state() private profileName: string | null | undefined

  @state() private profileImage: string | null | undefined

  @state() private network: CaipNetwork | undefined

  @state() private networkImage: string | undefined

  // eslint-disable-next-line no-nested-ternary
  @state() private isSupported = OptionsController.state.allowUnsupportedChain
    ? true
    : ChainController.getActiveCaipNetwork()?.chainNamespace
      ? ChainController.checkIfSupportedNetwork(
          ChainController.getActiveCaipNetwork()?.chainNamespace as ChainNamespace
        )
      : true

  // -- Lifecycle ----------------------------------------- //
  public override connectedCallback() {
    super.connectedCallback()
    if (this.namespace) {
      this.setAccountData(ConnectionController.getAccountData(this.namespace))
      this.setNetworkData(ChainController.getSnapshot().context.namespaces.get(this.namespace))
    }
  }

  public override firstUpdated() {
    const namespace = this.namespace

    if (namespace) {
      this.unsubscribe.push(
        ConnectionController.subscribeKey('connections', () => {
          this.setAccountData(ConnectionController.getAccountData(this.namespace))
        }),
        ChainController.subscribe(() => {
          this.setNetworkData(ChainController.getSnapshot().context.namespaces.get(this.namespace))
          this.isSupported = ChainController.checkIfSupportedNetwork(
            this.namespace as ChainNamespace
          )
        }),
        ChainController.subscribe(() => {
          this.setNetworkData(ChainController.getSnapshot().context.namespaces.get(this.namespace))
          this.isSupported = ChainController.checkIfSupportedNetwork(
            this.namespace as ChainNamespace
          )
        })
      )
    } else {
      this.unsubscribe.push(
        AssetController.subscribeNetworkImages(() => {
          this.networkImage = AssetUtil.getNetworkImage(this.network)
        }),
        ConnectionController.subscribeKey('connections', () => {
          this.setAccountData(ConnectionController.getAccountData(this.namespace))
        }),
        ChainController.subscribe(() => {
          this.setNetworkData(ChainController.getSnapshot().context.namespaces.get(this.namespace))
          this.isSupported = ChainController.checkIfSupportedNetwork(
            this.namespace as ChainNamespace
          )
          this.fetchNetworkImage(this.network)
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
    if (!ChainController.getActiveCaipNetwork()?.chainNamespace) {
      return null
    }

    const shouldShowBalance = this.balance === 'show'
    const shouldShowLoading = typeof this.balanceVal !== 'string'
    const { formattedText } = CoreHelperUtil.parseBalance(this.balanceVal, this.balanceSymbol)

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
        balance=${shouldShowBalance ? formattedText : ''}
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
  private onClick() {
    if (this.isSupported || OptionsController.state.allowUnsupportedChain) {
      ModalController.open({ namespace: this.namespace })
    } else {
      ModalController.open({ view: 'UnsupportedChain' })
    }
  }

  private async fetchNetworkImage(network?: CaipNetwork) {
    if (network?.assets?.imageId) {
      this.networkImage = await AssetUtil.fetchNetworkImage(network?.assets?.imageId)
    }
  }

  private setAccountData(accountState: AccountState | undefined) {
    if (!accountState) {
      return
    }

    this.caipAddress = accountState.caipAddress
    this.balanceVal = accountState.balance
    this.balanceSymbol = accountState.balanceSymbol
    this.profileName = accountState.profileName
    this.profileImage = accountState.profileImage
  }

  private setNetworkData(networkState: NamespaceState | undefined) {
    if (!networkState) {
      return
    }

    this.network = networkState.caipNetwork
    this.networkImage = AssetUtil.getNetworkImage(networkState.caipNetwork)
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
