import { ChainController, ModalController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import type { AppKitAccountButton } from '../appkit-account-button/index.js'
import type { AppKitConnectButton } from '../appkit-connect-button/index.js'
import styles from './styles.js'

@customElement('appkit-button')
export class AppKitButton extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled?: AppKitAccountButton['disabled'] = false

  @property() public balance?: AppKitAccountButton['balance'] = undefined

  @property() public size?: AppKitConnectButton['size'] = undefined

  @property() public label?: AppKitConnectButton['label'] = undefined

  @property() public loadingLabel?: AppKitConnectButton['loadingLabel'] = undefined

  @property() public charsStart?: AppKitAccountButton['charsStart'] = 4

  @property() public charsEnd?: AppKitAccountButton['charsEnd'] = 6

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

declare global {
  interface HTMLElementTagNameMap {
    'appkit-button': AppKitButton
  }
}
