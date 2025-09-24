import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { CaipAddress, ChainNamespace } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

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

  @property() public namespace?: ChainNamespace = undefined

  @state() private caipAddress: CaipAddress | undefined

  // -- Lifecycle ----------------------------------------- //
  public override firstUpdated() {
    this.caipAddress = this.namespace
      ? ChainController.getAccountData(this.namespace)?.caipAddress
      : ChainController.state.activeCaipAddress
    if (this.namespace) {
      this.unsubscribe.push(
        ChainController.subscribeChainProp(
          'accountState',
          val => {
            this.caipAddress = val?.caipAddress
          },
          this.namespace
        )
      )
    } else {
      this.unsubscribe.push(
        ChainController.subscribeKey('activeCaipAddress', val => (this.caipAddress = val))
      )
    }
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return this.caipAddress
      ? html`
          <appkit-account-button
            .disabled=${Boolean(this.disabled)}
            balance=${ifDefined(this.balance)}
            .charsStart=${ifDefined(this.charsStart)}
            .charsEnd=${ifDefined(this.charsEnd)}
            namespace=${ifDefined(this.namespace)}
          >
          </appkit-account-button>
        `
      : html`
          <appkit-connect-button
            size=${ifDefined(this.size)}
            label=${ifDefined(this.label)}
            loadingLabel=${ifDefined(this.loadingLabel)}
            namespace=${ifDefined(this.namespace)}
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
