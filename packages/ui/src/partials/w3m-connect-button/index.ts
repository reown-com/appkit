import { ModalCtrl } from '@web3modal/core'
import { html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import '../../components/w3m-spinner'
import '../../components/w3m-text'
import { scss } from '../../style/utils'
import { WALLET_CONNECT_ICON } from '../../utils/Svgs'
import { global, color } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import styles from './styles.css'

@customElement('w3m-connect-button')
export class W3mConnectButton extends ThemedElement {
  public static styles = [global, scss`${styles}`]

  // -- state & properties ------------------------------------------- //
  @state() public loading = false
  @property() public label? = 'Connect Wallet'
  @property() public icon? = true

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.modalUnsub = ModalCtrl.subscribe(modalState => {
      if (modalState.open) this.loading = true
      if (!modalState.open) this.loading = false
    })
  }

  public disconnectedCallback() {
    super.disconnectedCallback()
    this.modalUnsub?.()
  }

  protected dynamicStyles() {
    const { foreground, background, overlay } = color()

    return html` <style>
      button {
        color: ${foreground.inverse};
        background-color: ${foreground.accent};
      }

      button::after {
        border: 1px solid ${overlay.thin};
      }

      button:hover::after {
        background-color: ${overlay.thin};
      }

      .w3m-button-loading:disabled {
        background-color: ${background.accent};
      }

      button:disabled {
        background-color: ${background[3]};
        color: ${foreground[3]};
      }

      svg path {
        fill: ${foreground.inverse};
      }

      button:disabled svg path {
        fill: ${foreground[3]};
      }
    </style>`
  }

  // -- private ------------------------------------------------------ //
  private readonly modalUnsub?: () => void = undefined

  private iconTemplate() {
    return this.icon ? WALLET_CONNECT_ICON : null
  }

  private onOpen() {
    try {
      this.loading = true
      ModalCtrl.open()
    } catch {
      this.loading = false
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-button-loading': this.loading
    }

    return html`
      ${this.dynamicStyles()}

      <button class=${classMap(classes)} .disabled=${this.loading} @click=${this.onOpen}>
        ${this.loading
          ? html`
              <w3m-spinner></w3m-spinner>
              <w3m-text variant="medium-normal" color="accent">Connecting...</w3m-text>
            `
          : html`
              ${this.iconTemplate()}
              <w3m-text variant="medium-normal" color="inverse">${this.label}</w3m-text>
            `}
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-button': W3mConnectButton
  }
}
