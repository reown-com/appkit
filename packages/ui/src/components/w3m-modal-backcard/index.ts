import { ModalCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { scss } from '../../style/utils'
import { CROSS_ICON, HELP_ICON, NOISE_TEXTURE, WALLET_CONNECT_LOGO } from '../../utils/Svgs'
import { global, color } from '../../utils/Theme'
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

  protected dynamicStyles() {
    const { overlay, background, foreground } = color()

    return html`<style>
      .w3m-gradient-placeholder {
        background: linear-gradient(#cad8f2, #be3620, #a6208c, #06968f);
      }

      .w3m-modal-highlight {
        border: 1px solid ${overlay.thin};
      }

      .w3m-modal-action-btn {
        background-color: ${background[1]};
      }

      .w3m-modal-action-btn:hover {
        background-color: ${background[2]};
      }

      .w3m-modal-action-btn path {
        fill: ${foreground[1]};
      }

      .w3m-modal-action-btn {
        box-shadow: 0 0 0 1px ${overlay.thin}, 0px 2px 4px -2px rgba(0, 0, 0, 0.12),
          0px 4px 4px -2px rgba(0, 0, 0, 0.08);
      }

      .w3m-help-active button:first-child {
        background-color: ${foreground.accent};
      }
    </style>`
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
      ${this.dynamicStyles()}

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
