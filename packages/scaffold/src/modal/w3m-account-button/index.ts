import {
  AccountController,
  AssetController,
  CoreHelperUtil,
  ModalController,
  NetworkController
} from '@web3modal/core'
import type { WuiAccountButton } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-account-button')
export class W3mAccountButton extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private readonly networkImages = AssetController.state.networkImages

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) disabled?: WuiAccountButton['disabled'] = false

  @state() private open = ModalController.state.open

  @state() private address = AccountController.state.address

  @state() private balance = AccountController.state.balance

  @state() private balanceSymbol = AccountController.state.balanceSymbol

  @state() private profileName = AccountController.state.profileName

  @state() private profileImage = AccountController.state.profileImage

  @state() private network = NetworkController.state.caipNetwork

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ModalController.subscribeKey('open', val => (this.open = val)),
        AccountController.subscribe(val => {
          this.address = val.address
          this.balance = val.balance
          this.profileName = val.profileName
          this.profileImage = val.profileImage
          this.balanceSymbol = val.balanceSymbol
        }),
        NetworkController.subscribeKey('caipNetwork', val => (this.network = val))
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const networkImage = this.networkImages[this.network?.imageId ?? '']

    return html`
      <wui-account-button
        .disabled=${Boolean(this.disabled)}
        address=${ifDefined(this.profileName ?? this.address)}
        networkSrc=${ifDefined(networkImage)}
        avatarSrc=${ifDefined(this.profileImage)}
        balance=${CoreHelperUtil.formatBalance(this.balance, this.balanceSymbol)}
        @click=${this.onClick.bind(this)}
      >
      </wui-account-button>
    `
  }

  // -- Private ------------------------------------------- //
  private onClick() {
    if (this.open) {
      ModalController.close()
    } else {
      ModalController.open()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-button': W3mAccountButton
  }
}
