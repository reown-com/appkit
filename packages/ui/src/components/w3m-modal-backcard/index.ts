import { ModalCtrl, RouterCtrl, ThemeCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import Whatamesh from '../../libs/Whatamesh'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

const whatamesh = new Whatamesh()

@customElement('w3m-modal-backcard')
export class W3mModalBackcard extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private open = false
  @state() private isHelp = false

  // -- lifecycle ---------------------------------------------------- //
  public firstUpdated() {
    if (!this.isCustomBg()) {
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
    return UiUtil.getShadowRootElement(this, '.w3m-canvas')
  }

  private onHelp() {
    RouterCtrl.push('Help')
  }

  private isCustomBg() {
    return (
      ThemeCtrl.state.themeVariables?.['--w3m-background-color'] ||
      ThemeCtrl.state.themeVariables?.['--w3m-background-image-url']
    )
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-canvas': true,
      'w3m-canvas-visible': this.open
    }

    const actionsClasses = {
      'w3m-actions': true,
      'w3m-help-active': this.isHelp
    }

    return html`
      ${this.isCustomBg()
        ? html`<div class="w3m-custom-placeholder"></div>`
        : html`
            <div class="w3m-gradient-placeholder"></div>
            <canvas class=${classMap(classes)}></canvas>
            ${SvgUtil.NOISE_TEXTURE}
          `}

      <div class="w3m-highlight"></div>
      <div class="w3m-toolbar">
        ${SvgUtil.WALLET_CONNECT_LOGO}
        <div class=${classMap(actionsClasses)}>
          <button class="w3m-action-btn" @click=${this.onHelp}>${SvgUtil.HELP_ICON}</button>
          <button class="w3m-action-btn" @click=${ModalCtrl.close}>${SvgUtil.CROSS_ICON}</button>
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
