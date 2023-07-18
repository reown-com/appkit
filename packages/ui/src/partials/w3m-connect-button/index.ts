import { AccountCtrl, ClientCtrl, EventsCtrl, ModalCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-connect-button')
export class W3mConnectButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() public loading = false

  @property() public label? = 'Connect Wallet'

  @property() public icon?: 'hide' | 'show' = 'show'

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.modalUnsub = ModalCtrl.subscribe(modalState => {
      if (modalState.open) {
        this.loading = true
      }
      if (!modalState.open) {
        this.loading = false
      }
    })
  }

  public disconnectedCallback() {
    this.modalUnsub?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly modalUnsub?: () => void = undefined

  private iconTemplate() {
    return this.icon === 'show' ? SvgUtil.WALLET_CONNECT_ICON : null
  }

  private onClick() {
    if (AccountCtrl.state.isConnected) {
      this.onDisconnect()
    } else {
      this.onConnect()
    }
  }

  private async onConnect() {
    this.loading = true
    EventsCtrl.click({ name: 'CONNECT_BUTTON' })
    await ModalCtrl.open()
    if (!ModalCtrl.state.open) {
      this.loading = false
    }
  }

  private async onDisconnect() {
    EventsCtrl.click({ name: 'DISCONNECT_BUTTON' })
    await ClientCtrl.client().disconnect()
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-button-big
        .disabled=${this.loading}
        @click=${this.onClick}
        data-testid="partial-connect-button"
      >
        ${this.loading
          ? html`
              <w3m-spinner data-testid="partial-connect-spinner"></w3m-spinner>
              <w3m-text variant="medium-regular" color="accent" data-testid="partial-connect-text"
                >Connecting...</w3m-text
              >
            `
          : html`
              ${this.iconTemplate()}
              <w3m-text variant="medium-regular" color="inverse" data-testid="partial-connect-text"
                >${this.label}</w3m-text
              >
            `}
      </w3m-button-big>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-button': W3mConnectButton
  }
}
