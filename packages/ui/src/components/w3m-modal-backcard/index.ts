import { ModalCtrl, RouterCtrl, ThemeCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-modal-backcard')
export class W3mModalBackcard extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private isHelp = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.unsubscribeRouter = RouterCtrl.subscribe(routerState => {
      this.isHelp = routerState.view === 'Help'
    })
  }

  public disconnectedCallback() {
    this.unsubscribeRouter?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeRouter?: () => void = undefined

  private onHelp() {
    RouterCtrl.push('Help')
  }

  private logoTemplate() {
    const customSrc = ThemeCtrl.state.themeVariables?.['--w3m-logo-image-url']

    if (customSrc) {
      return html`<img
        crossorigin="anonymous"
        src=${customSrc}
        data-testid="component-modal-backcard"
      />`
    }

    return SvgUtil.WALLET_CONNECT_LOGO
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const actionsClasses = {
      'w3m-help-active': this.isHelp
    }

    return html`
      <div class="w3m-toolbar-placeholder"></div>
      <div class="w3m-toolbar">
        ${this.logoTemplate()}
        <div class=${classMap(actionsClasses)}>
          <button @click=${this.onHelp} data-testid="backcard-help">${SvgUtil.HELP_ICON}</button>
          <button @click=${ModalCtrl.close} data-testid="backcard-close">
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
