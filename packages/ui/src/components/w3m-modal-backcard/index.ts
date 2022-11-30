import { ConfigCtrl, ModalCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { SvgUtil } from '../../utils/SvgUtil'
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
    const { themeBackground } = ConfigCtrl.state
    if (themeBackground === 'gradient') {
      this.playTimeout = setTimeout(() => {
        whatamesh.play(this.canvasEl)
        this.open = true
      }, 800)
    }
  }

  public constructor() {
    super()
    this.unsubscribeRouter = RouterCtrl.subscribe(routerState => {
      this.isHelp = routerState.view === 'Help'
    })
  }

  public disconnectedCallback() {
    this.unsubscribeRouter?.()
    clearTimeout(this.playTimeout)
    whatamesh.stop()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeRouter?: () => void = undefined
  private playTimeout?: NodeJS.Timeout = undefined

  private get canvasEl() {
    return getShadowRootElement(this, '.w3m-gradient-canvas')
  }

  private onHelp() {
    RouterCtrl.push('Help')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { themeBackground } = ConfigCtrl.state
    const classes = {
      'w3m-gradient-canvas': true,
      'w3m-gradient-canvas-visible': this.open
    }

    const actionsClasses = {
      'w3m-actions': true,
      'w3m-help-active': this.isHelp
    }

    return html`
      ${themeBackground === 'themeColor' ? html`<div class="w3m-color-placeholder"></div>` : null}
      ${themeBackground === 'gradient'
        ? html`
            <div class="w3m-gradient-placeholder"></div>
            <canvas class=${classMap(classes)}></canvas>
            ${SvgUtil.NOISE_TEXTURE}
          `
        : null}

      <div class="w3m-modal-highlight"></div>
      <div class="w3m-modal-toolbar">
        ${SvgUtil.WALLET_CONNECT_LOGO}
        <div class=${classMap(actionsClasses)}>
          <button class="w3m-modal-action-btn" @click=${this.onHelp}>${SvgUtil.HELP_ICON}</button>
          <button class="w3m-modal-action-btn" @click=${ModalCtrl.close}>
            ${SvgUtil.CROSS_ICON}
          </button>
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
