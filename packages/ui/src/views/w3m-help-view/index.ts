import { RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import '../../components/w3m-button'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-footer'
import '../../components/w3m-modal-header'
import { ARROW_UP_RIGHT_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-help-view')
export class W3mHelpView extends LitElement {
  public static styles = [global, styles]

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
    super.disconnectedCallback()
    this.unsubscribeRouter?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeRouter?: () => void = undefined

  private onGet() {
    RouterCtrl.push('GetWallet')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}

      <w3m-modal-header title="What is a wallet?"></w3m-modal-header>
      <w3m-modal-content> yas </w3m-modal-content>
      <w3m-modal-footer>
        <w3m-button onClick=${this.onGet} .iconRight=${ARROW_UP_RIGHT_ICON}>
          Get a Wallet
        </w3m-button>
        <w3m-button .onClick=${this.onGet} .iconRight=${ARROW_UP_RIGHT_ICON}>
          Learn More
        </w3m-button>
      </w3m-modal-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-help-view': W3mHelpView
  }
}
