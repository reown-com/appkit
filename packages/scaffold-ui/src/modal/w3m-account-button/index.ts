import {
  AccountController,
  AssetController,
  AssetUtil,
  ChainController,
  CoreHelperUtil,
  ModalController
} from '@reown/appkit-core'

import type { WuiAccountButton } from '@reown/appkit-ui'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-account-button')
export class W3mAccountButton extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled?: WuiAccountButton['disabled'] = false

  @property() public balance?: 'show' | 'hide' = 'show'

  @property() public charsStart?: WuiAccountButton['charsStart'] = 4

  @property() public charsEnd?: WuiAccountButton['charsEnd'] = 6

  @state() private caipAddress = ChainController.state.activeCaipAddress

  @state() private balanceVal = AccountController.state.balance

  @state() private balanceSymbol = AccountController.state.balanceSymbol

  @state() private profileName = AccountController.state.profileName

  @state() private profileImage = AccountController.state.profileImage

  @state() private network = ChainController.state.activeCaipNetwork

  @state() private networkImage = this.network ? AssetUtil.getNetworkImage(this.network) : undefined

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AssetController.subscribeNetworkImages(() => {
          this.networkImage = this.network?.imageId
            ? AssetUtil.getNetworkImage(this.network)
            : undefined
        }),
        ChainController.subscribeKey('activeCaipAddress', val => (this.caipAddress = val)),
        AccountController.subscribeKey('balance', val => (this.balanceVal = val)),
        AccountController.subscribeKey('balanceSymbol', val => (this.balanceSymbol = val)),
        AccountController.subscribeKey('profileName', val => (this.profileName = val)),
        AccountController.subscribeKey('profileImage', val => (this.profileImage = val)),
        ChainController.subscribeKey('activeCaipNetwork', val => {
          this.network = val
          this.networkImage = val?.imageId ? AssetUtil.getNetworkImage(val) : undefined
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const showBalance = this.balance === 'show'

    return html`
      <wui-account-button
        .disabled=${Boolean(this.disabled)}
        .isUnsupportedChain=${!ChainController.isCurrentNetworkSupported()}
        address=${ifDefined(CoreHelperUtil.getPlainAddress(this.caipAddress))}
        profileName=${ifDefined(this.profileName)}
        networkSrc=${ifDefined(this.networkImage)}
        avatarSrc=${ifDefined(this.profileImage)}
        balance=${showBalance
          ? CoreHelperUtil.formatBalance(this.balanceVal, this.balanceSymbol)
          : ''}
        @click=${this.onClick.bind(this)}
        data-testid="account-button"
        .charsStart=${this.charsStart}
        .charsEnd=${this.charsEnd}
      >
      </wui-account-button>
    `
  }

  // -- Private ------------------------------------------- //
  private onClick() {
    if (ChainController.isCurrentNetworkSupported()) {
      ModalController.open()
    } else {
      ModalController.open({ view: 'UnsupportedChain' })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-button': W3mAccountButton
  }
}
