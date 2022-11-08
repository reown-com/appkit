import { ToastCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { scss } from '../../style/utils'
import { CHECKMARK_ICON, CROSS_ICON } from '../../utils/Svgs'
import { global, color } from '../../utils/Theme'
import '../w3m-text'
import styles from './styles.scss'

@customElement('w3m-modal-toast')
export class W3mModalToast extends LitElement {
  public static styles = [global, scss`${styles}`]

  // -- state & properties ------------------------------------------- //
  @state() public open = false

  public constructor() {
    super()
    this.unsubscribe = ToastCtrl.subscribe(newState => {
      if (newState.open) {
        this.open = true
        this.timeout = setTimeout(() => ToastCtrl.closeToast(), 1200)
      } else {
        this.open = false
        clearTimeout(this.timeout)
      }
    })
  }

  protected dynamicStyles() {
    const { foreground, error, background, overlay } = color()

    return html`<style>
      .w3m-modal-toast {
        border: 1px solid ${overlay.thin};
        background-color: ${overlay.thin};
      }

      @-moz-document url-prefix() {
        .w3m-modal-toast {
          background-color: ${background.accent};
        }
      }

      .w3m-success path {
        fill: ${foreground.accent};
      }

      .w3m-error path {
        fill: ${error};
      }
    </style>`
  }

  public disconnectedCallback() {
    this.unsubscribe?.()
    clearTimeout(this.timeout)
    ToastCtrl.closeToast()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribe?: () => void = undefined
  private timeout?: NodeJS.Timeout = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    const { message, variant } = ToastCtrl.state
    const classes = {
      'w3m-modal-toast': true,
      'w3m-success': variant === 'success',
      'w3m-error': variant === 'error'
    }

    return this.open
      ? html`
          ${this.dynamicStyles()}

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
