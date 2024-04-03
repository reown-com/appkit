import {
  AccountController,
  ModalController,
  OptionsController,
  type AccountType
} from '@web3modal/core'
import { UiHelperUtil, customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'

@customElement('w3m-switch-address-view')
export class W3mSwitchAddressView extends LitElement {
  public static override styles = styles
  // -- Members ------------------------------------------- //
  private readonly metadata = OptionsController.state.metadata
  public readonly addresses: AccountType[] = AccountController.state.allAccounts || []
  public readonly currentAddress: string = AccountController.state.address || ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex justifyContent="center" .padding=${['xl', '0', 'xl', '0'] as const}>
        <wui-banner-img imageSrc="${this.metadata?.icons[0]}" text="${this.metadata
          ?.url}" size="sm"></wui-banner>
      </wui-flex>
      <wui-flex flexDirection="column" gap="xxl" .padding=${['l', 'xl', 'xl', 'xl'] as const}>
        ${this.addresses.map(address => {
          return this.getAddressTemplate(address.address)
        })}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private getAddressTemplate(address: string) {
    return html`
      <wui-flex flexDirection="row" justifyContent="space-between">
        <wui-flex gap="s" alignItems="center">
          <wui-avatar address=${address}></wui-avatar>
          <wui-flex flexDirection="column">
            <wui-text class="address" variant="paragraph-500" color="fg-100"
              >${UiHelperUtil.getTruncateString({
                string: address,
                charsStart: 4,
                charsEnd: 6,
                truncate: 'middle'
              })}</wui-text
            >
            <wui-text class="address-description" variant="small-400">$20,23.43</wui-text></wui-flex
          >
        </wui-flex>
        <wui-flex gap="s" alignItems="center">
          ${address === this.currentAddress
            ? ''
            : html`
                <wui-button
                  textVariant="small-600"
                  size="sm"
                  variant="accent"
                  @click=${() => this.onSwitchAddress(address)}
                  >Switch to</wui-button
                >
              `}
        </wui-flex>
      </wui-flex>
    `
  }

  private onSwitchAddress(address: string) {
    console.log('onSwitchAddress', address)
    AccountController.setShouldUpdateToAddress(address)
    ModalController.close()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-switch-address-view': W3mSwitchAddressView
  }
}
