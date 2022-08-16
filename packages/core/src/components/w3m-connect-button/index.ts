import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { subscribe } from 'valtio/vanilla'
import ModalCtrl from '../../controllers/ModalCtrl'
import walletConnectIcon from '../../images/walletConnectIcon'
import colors from '../../theme/color'
import fonts from '../../theme/fonts'
import global from '../../theme/global'
import '../w3m-spinner'
import styles from './styles'

@customElement('w3m-connect-button')
export class W3mConnectButton extends LitElement {
  public static styles = [global, fonts(), styles]

  // -- state & properties ------------------------------------------- //
  @state() public loading = false
  @state() private readonly classes = {
    'w3m-button-loading': Boolean(this.loading),
    'w3m-font': true,
    'w3m-font-medium-normal': true
  }
  @property() public label?: string = 'Connect Wallet'
  @property() public icon?: boolean = true

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe = subscribe(ModalCtrl.state, () => {
      if (ModalCtrl.state.open) this.loading = true
      if (!ModalCtrl.state.open) this.loading = false
    })
  }

  public disconnectedCallback() {
    this.unsubscribe?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribe?: () => void = undefined

  private iconTemplate() {
    return this.icon ? walletConnectIcon : null
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <button
        class=${classMap(this.classes)}
        .disabled=${this.loading}
        @click=${ModalCtrl.openModal}
      >
        ${this.loading
          ? html`<w3m-spinner color=${colors().dark.foreground.accent}></loading-spinner>`
          : html`${this.iconTemplate()} <span>${this.label}</span>`}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-button': W3mConnectButton
  }
}
