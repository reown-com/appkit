import { ModalCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { CROSS_ICON, HELP_ICON, NOISE_TEXTURE, WALLET_CONNECT_LOGO } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import { getShadowRootElement } from '../../utils/UiHelpers'
import Whatamesh from '../../utils/Whatamesh'
import styles from './styles.css'

const whatamesh = new Whatamesh()

@customElement('w3m-modal-backcard')
export class W3mModalBackcard extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private open = false
  @state() private isHelp = false

  // -- lifecycle ---------------------------------------------------- //
  public firstUpdated() {
    setTimeout(() => {
      whatamesh.play(this.canvasEl)
      this.open = true
    }, 1000)
  }

  public constructor() {
    super()
    this.unsubscribeRouter = RouterCtrl.subscribe(routerState => {
      this.isHelp = routerState.view === 'Help'
    })
  }

  public disconnectedCallback() {
    super.disconnectedCallback()
    this.unsubscribeRouter?.()
    whatamesh.stop()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeRouter?: () => void = undefined

  private get canvasEl() {
    return getShadowRootElement(this, '.w3m-gradient-canvas')
  }

  private onHelp() {
    RouterCtrl.push('Help')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-gradient-canvas': true,
      'w3m-gradient-canvas-visible': this.open
    }

    const actionsClasses = {
      'w3m-actions': true,
      'w3m-help-active': this.isHelp
    }

    return html`
      <div class="w3m-gradient-placeholder"></div>
      <canvas class=${classMap(classes)}></canvas>
      ${NOISE_TEXTURE}
      <div class="w3m-modal-highlight"></div>
      <div class="w3m-modal-toolbar">
        ${WALLET_CONNECT_LOGO}
        <div class=${classMap(actionsClasses)}>
          <button class="w3m-modal-action-btn" @click=${this.onHelp}>${HELP_ICON}</button>
          <button class="w3m-modal-action-btn" @click=${ModalCtrl.close}>${CROSS_ICON}</button>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-backcard': W3mModalBackcard
  }
}
