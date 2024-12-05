import { customElement } from '@reown/appkit-ui'
import { ModalController } from '@reown/appkit-core'
import type { WuiConnectButton } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

class W3mConnectButtonBase extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public size?: WuiConnectButton['size'] = 'md'

  @property() public label? = 'Connect Wallet'

  @property() public loadingLabel? = 'Connecting...'

  @state() private open = ModalController.state.open

  @state() private loading = ModalController.state.loading

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ModalController.subscribe(val => {
        this.open = val.open
        this.loading = val.loading
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const isLoading = this.loading || this.open

    return html`
      <wui-connect-button
        size=${ifDefined(this.size)}
        .loading=${isLoading}
        @click=${this.onClick.bind(this)}
        data-testid="connect-button"
      >
        ${isLoading ? this.loadingLabel : this.label}
      </wui-connect-button>
    `
  }

  // -- Private ------------------------------------------- //
  private onClick() {
    if (this.open) {
      ModalController.close()
    } else if (!this.loading) {
      ModalController.open()
    }
  }
}

@customElement('w3m-connect-button')
export class W3mConnectButton extends W3mConnectButtonBase {}

@customElement('appkit-connect-button')
export class AppKitConnectButton extends W3mConnectButtonBase {}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-button': W3mConnectButton
    'appkit-connect-button': AppKitConnectButton
  }
}
