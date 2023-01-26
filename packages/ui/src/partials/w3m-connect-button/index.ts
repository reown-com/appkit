import { ClientCtrl, ConfigCtrl, ModalCtrl, OptionsCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
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
    UiUtil.rejectStandaloneButtonComponent()
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
    if (OptionsCtrl.state.isConnected) {
      this.onDisconnect()
    } else {
      this.onConnect()
    }
  }

  private onConnect() {
    this.loading = true
    const { enableNetworkView } = ConfigCtrl.state
    const { chains, selectedChain } = OptionsCtrl.state
    const isChainsList = chains?.length && chains.length > 1
    if (enableNetworkView || (isChainsList && !selectedChain)) {
      ModalCtrl.open({ route: 'SelectNetwork' })
    } else {
      ModalCtrl.open({ route: 'ConnectWallet' })
    }
  }

  private onDisconnect() {
    ClientCtrl.client().disconnect()
    OptionsCtrl.resetAccount()
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-button-big .disabled=${this.loading} @click=${this.onClick}>
        ${this.loading
          ? html`
              <w3m-spinner></w3m-spinner>
              <w3m-text variant="medium-normal" color="accent">Connecting...</w3m-text>
            `
          : html`
              ${this.iconTemplate()}
              <w3m-text variant="medium-normal" color="inverse">${this.label}</w3m-text>
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
