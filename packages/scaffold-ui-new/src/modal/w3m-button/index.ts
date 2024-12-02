import { customElement } from '@reown/appkit-ui'
import { ChainController, ModalController } from '@reown/appkit-core'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import type { W3mAccountButton } from '../w3m-account-button/index.js'
import type { W3mConnectButton } from '../w3m-connect-button/index.js'
import styles from './styles.js'

class W3mButtonBase extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled?: W3mAccountButton['disabled'] = false

  @property() public balance?: W3mAccountButton['balance'] = undefined

  @property() public size?: W3mConnectButton['size'] = undefined

  @property() public label?: W3mConnectButton['label'] = undefined

  @property() public loadingLabel?: W3mConnectButton['loadingLabel'] = undefined

  @property() public charsStart?: W3mAccountButton['charsStart'] = 4

  @property() public charsEnd?: W3mAccountButton['charsEnd'] = 6

  @state() private caipAddress = ChainController.state.activeCaipAddress

  @state() private isLoading = ModalController.state.loading

  // -- Lifecycle ----------------------------------------- //
  public override firstUpdated() {
    this.unsubscribe.push(
      ChainController.subscribeKey('activeCaipAddress', val => (this.caipAddress = val)),
      ModalController.subscribeKey('loading', val => (this.isLoading = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return this.caipAddress && !this.isLoading
      ? html`
          <appkit-account-button
            .disabled=${Boolean(this.disabled)}
            balance=${ifDefined(this.balance)}
            .charsStart=${ifDefined(this.charsStart)}
            .charsEnd=${ifDefined(this.charsEnd)}
          >
          </appkit-account-button>
        `
      : html`
          <appkit-connect-button
            size=${ifDefined(this.size)}
            label=${ifDefined(this.label)}
            loadingLabel=${ifDefined(this.loadingLabel)}
          ></appkit-connect-button>
        `
  }
}

@customElement('w3m-button')
export class W3mButton extends W3mButtonBase {}

@customElement('appkit-button')
export class AppKitButton extends W3mButtonBase {}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-button': W3mButton
    'appkit-button': AppKitButton
  }
}
