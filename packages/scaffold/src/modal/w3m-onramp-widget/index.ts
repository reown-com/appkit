import { AccountController, ModalController, NetworkController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-onramp-widget')
export class W3mOnrampWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled? = false

  @state() private connected = AccountController.state.isConnected

  @state() private loading = ModalController.state.loading

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        NetworkController.subscribeKey('caipNetwork', val => {
          this.network = val
        }),
        AccountController.subscribeKey('isConnected', val => {
          this.connected = val
        }),
        ModalController.subscribeKey('loading', val => {
          this.loading = val
        })
      ]
    )
  }

  public override disconnectedCallback() {
    for (const unsubscribe of this.unsubscribe) {
      unsubscribe()
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center">
        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-input-text type="number">
            <wui-flex
              class="currency-container"
              justifyContent="center"
              alignItems="center"
              gap="xxs"
            >
              <wui-image
                src="https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/692ed6ba-e569-459a-556a-776476829e00?projectId=c1781fc385454899a2b1385a2b83df3b"
              ></wui-image>
              EUR
            </wui-flex>
          </wui-input-text>
          <wui-input-text type="number">
            <wui-flex
              class="currency-container"
              justifyContent="center"
              alignItems="center"
              gap="xxs"
            >
              <wui-image
                src="https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/692ed6ba-e569-459a-556a-776476829e00?projectId=c1781fc385454899a2b1385a2b83df3b"
              ></wui-image>
              ETH
            </wui-flex>
          </wui-input-text>
          ${this.templateButton()}
        </wui-flex>
      </wui-flex>
    `
  }

  private templateButton() {
    return this.connected
      ? html`<wui-button @click=${this.onClick.bind(this)} variant="fill" fullWidth>
          Get quotes
        </wui-button>`
      : html`<w3m-connect-button></w3m-connect-button>`
  }

  // -- Private ------------------------------------------- //
  private onClick() {
    if (!this.loading) {
      ModalController.open({ view: 'OnRampProviders' })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-widget': W3mOnrampWidget
  }
}
