import { ModalCtrl } from '@web3modal/core'
import { html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { WALLET_CONNECT_ICON } from '../../utils/Svgs'
import { color, global } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import '../w3m-spinner'
import '../w3m-text'
import styles from './styles'

@customElement('w3m-connect-button')
export class W3mConnectButton extends ThemedElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() public loading = false
  @state() private readonly classes = {
    'w3m-button-loading': this.loading
  }
  @property() public label?: string = 'Connect Wallet'
  @property() public icon?: boolean = true

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.modalUnsub = ModalCtrl.subscribe(modalState => {
      if (modalState.open) this.loading = true
      if (!modalState.open) this.loading = false
    })
  }

  public disconnectedCallback() {
    this.modalUnsub?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly modalUnsub?: () => void = undefined

  private iconTemplate() {
    return this.icon ? WALLET_CONNECT_ICON : null
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${this.dynamicStyles()}

      <button
        class=${classMap(this.classes)}
        .disabled=${this.loading}
        @click=${ModalCtrl.openModal}
      >
        ${this.loading
          ? html`<w3m-spinner color=${color().foreground.accent}></loading-spinner>`
          : html`${this.iconTemplate()} <w3m-text variant="medium-normal">${this.label}</w3m-text>`}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-button': W3mConnectButton
  }
}
