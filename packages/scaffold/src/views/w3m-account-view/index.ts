import { EnsController, OptionsController, StorageUtil } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  // -- Render -------------------------------------------- //

  public override firstUpdated(): void {
    EnsController.resolveName('rocky.wc.ink').then(console.log)
    EnsController.getNamesForAddress('0x13302Eb0aD9Af2F847119dC4Ac632fFe196d0B0f').then(console.log)
  }

  public override render() {
    const type = StorageUtil.getConnectedConnector()

    return html`
      ${OptionsController.state.enableWalletFeatures && type === 'EMAIL'
        ? this.walletFeaturesTemplate()
        : this.defaultTemplate()}
    `
  }

  // -- Private ------------------------------------------- //
  private walletFeaturesTemplate() {
    return html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
  }

  private defaultTemplate() {
    return html`<w3m-account-default-widget></w3m-account-default-widget>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
