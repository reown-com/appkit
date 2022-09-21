import { ModalToastCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { CHECKMARK_ICON, CROSS_ICON } from '../../utils/Svgs'
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
      if (newState.open) {
        this.open = true
        this.timeout = setTimeout(() => ModalToastCtrl.closeToast(), 1200)
      } else {
        this.open = false
        clearTimeout(this.timeout)
      }
    })
  }

  public disconnectedCallback() {
    this.unsubscribe?.()
    clearTimeout(this.timeout)
    ModalToastCtrl.closeToast()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribe?: () => void = undefined
  private timeout?: NodeJS.Timeout = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    const { message, variant } = ModalToastCtrl.state
    const classes = {
      'w3m-modal-toast': true,
      'w3m-success': variant === 'success',
      'w3m-error': variant === 'error'
    }

    return this.open
      ? html`
          ${dynamicStyles()}

          <div class=${classMap(classes)}>
            ${variant === 'success' ? CHECKMARK_ICON : null}
            ${variant === 'error' ? CROSS_ICON : null}
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
