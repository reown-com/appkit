import {
  AccountController,
  ModalController,
  NetworkController,
  AssetUtil,
  RouterController
} from '@web3modal/core'
import { UiHelperUtil, customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-account-wallet-features-widget')
export class W3mAccountWalletFeaturesWidget extends LitElement {
  public static override styles = styles

  // -- Members -------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties --------------------------------- //
  @state() private address = AccountController.state.address

  @state() private profileImage = AccountController.state.profileImage

  @state() private profileName = AccountController.state.profileName

  @state() private network = NetworkController.state.caipNetwork

  @state() private balance = AccountController.state.balance

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribe(val => {
          if (val.address) {
            this.address = val.address
            this.profileImage = val.profileImage
            this.profileName = val.profileName
            this.balance = val.balance
          } else {
            ModalController.close()
          }
        })
      ],
      NetworkController.subscribeKey('caipNetwork', val => {
        if (val?.id) {
          this.network = val
        }
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.address) {
      throw new Error('w3m-account-view: No account provided')
    }

    const tabs = [{ label: 'Tokens', icon: '' }, { label: 'NFTs', icon: '' }, { label: 'Activity' }]

    const networkImage = AssetUtil.getNetworkImage(this.network)

    return html`<wui-flex
      flexDirection="column"
      .padding=${['0', 'xl', 'm', 'xl'] as const}
      alignItems="center"
      gap="l"
    >
      ${this.activateAccountTemplate()}
      <wui-profile-button
        @click=${this.onProfileButtonClick.bind(this)}
        address=${ifDefined(this.address)}
        networkSrc=${ifDefined(networkImage)}
        icon="chevronBottom"
        avatarSrc=${ifDefined(this.profileImage ? this.profileImage : undefined)}
        ?isprofilename=${Boolean(this.profileName)}
      ></wui-profile-button>
      <wui-balance
        dollars=${this.balance ? UiHelperUtil.splitBalance(this.balance)[0] : '0'}
        pennies="${this.balance ? UiHelperUtil.splitBalance(this.balance)[1] : '00'}"
      ></wui-balance>
      <wui-flex gap="s">
        <wui-tooltip-select
          @click=${this.handleClickPay.bind(this)}
          text="Buy"
          icon="card"
        ></wui-tooltip-select>
        <wui-tooltip-select text="Convert" icon="recycleHorizontal"></wui-tooltip-select>
        <wui-tooltip-select text="Receive" icon="arrowBottomCircle"></wui-tooltip-select>
        <wui-tooltip-select text="Send" icon="send"></wui-tooltip-select>
      </wui-flex>

      <wui-tabs localTabWidth="120px" .tabs=${tabs}></wui-tabs>
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //

  private activateAccountTemplate() {
    // Todo: Check if SA is deployed

    return html` <wui-promo text="Activate your account"></wui-promo>`
  }

  private onProfileButtonClick() {
    RouterController.push('AccountSettings')
  }

  private handleClickPay() {
    RouterController.push('OnRampProviders')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-wallet-features-widget': W3mAccountWalletFeaturesWidget
  }
}
