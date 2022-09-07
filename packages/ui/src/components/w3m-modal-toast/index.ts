import { ModalToastCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { CHECKMARK_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import '../w3m-text'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-modal-toast')
export class W3mModalToast extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() public open = false

  public constructor() {
    super()
    this.unsubscribe = ModalToastCtrl.subscribe(newState => {
      if (newState.open) this.open = true
    })
  }

  public disconnectedCallback() {
    this.unsubscribe?.()
    ModalToastCtrl.closeToast()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribe?: () => void = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-modal-toast': true,
      'w3m-open': this.open
    }
    const { message } = ModalToastCtrl.state

    return this.open
      ? html`
          ${dynamicStyles()}

          <div class=${classMap(classes)}>
            ${CHECKMARK_ICON}
            <w3m-text variant="small-normal">${message}</w3m-text>
          </div>
        `
      : null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-toast': W3mModalToast
  }
}
