import {
  AccountController,
  ConnectionController,
  CoreHelperUtil,
  ModalController
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  public static styles = styles

  // -- Members -------------------------------------------- //
  private usubscribe: (() => void)[] = []

  // -- State & Properties --------------------------------- //
  @state() private address = AccountController.state.address

  @state() private profileImage = AccountController.state.profileImage

  @state() private profileName = AccountController.state.profileName

  @state() private balance = AccountController.state.balance

  public constructor() {
    super()
    this.usubscribe.push(
      ...[
        AccountController.subscribe('address', value => (this.address = value)),
        AccountController.subscribe('profileImage', value => (this.profileImage = value)),
        AccountController.subscribe('profileName', value => (this.profileName = value)),
        AccountController.subscribe('balance', value => (this.balance = value))
      ]
    )
  }

  public disconnectedCallback() {
    this.usubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public render() {
    if (!this.address) {
      throw new Error('w3m-account-view: No account provided')
    }

    return html`
      <wui-flex flexDirection="column" padding="l" alignItems="center" gap="xs">
        <wui-avatar
          alt=${this.address}
          address=${this.address}
          imageSrc=${ifDefined(this.profileImage)}
        ></wui-avatar>

        <wui-flex gap="3xs" alignItems="center" justifyContent="center">
          <wui-text variant="large-600" color="fg-100">
            ${this.profileName ?? CoreHelperUtil.truncateAddress(this.address)}
          </wui-text>
          <wui-icon-link
            size="md"
            icon="copy"
            iconColor="fg-200"
            @click=${this.onCopyAddress}
          ></wui-icon-link>
        </wui-flex>
      </wui-flex>

      <wui-flex flexDirection="column" gap="xs" .padding=${['3xs', 'l', 'l', 'l'] as const}>
        <wui-list-item variant="icon" iconVariant="overlay" icon="networkPlaceholder">
          <wui-text variant="paragraph-500" color="fg-100">${this.balance ?? '_._'}</wui-text>
        </wui-list-item>
        <wui-list-item
          variant="icon"
          iconVariant="overlay"
          icon="disconnect"
          @click=${this.onDisconnect.bind(this)}
        >
          <wui-text variant="paragraph-500" color="fg-200">Disconnect</wui-text>
        </wui-list-item>
      </wui-flex>
    `
  }

  // -- Private Methods ------------------------------------ //
  private onCopyAddress() {
    try {
      if (this.address) {
        CoreHelperUtil.copyToClopboard(this.address)
      }
    } catch {
      // TASK: Show error toast
    }
  }

  private async onDisconnect() {
    await ConnectionController.disconnect()
    ModalController.close()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
