import { SnackController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

// -- Helpers ------------------------------------------- //
const presets = {
  loading: undefined,
  success: {
    backgroundColor: 'success-100',
    iconColor: 'success-100',
    icon: 'checkmark'
  },
  error: {
    backgroundColor: 'error-100',
    iconColor: 'error-100',
    icon: 'close'
  }
} as const

@customElement('w3m-toastbar')
export class W3mToastBar extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private timeout?: ReturnType<typeof setTimeout> = undefined

  // -- State & Properties -------------------------------- //
  @state() private open = SnackController.state.open

  public constructor() {
    super()
    this.unsubscribe.push(
      SnackController.subscribeKey('open', val => {
        this.open = val
        this.onOpen()
      })
    )
  }

  public override disconnectedCallback() {
    clearTimeout(this.timeout)
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    // @TODO: Replace SnackController with a new controller (ToastController)
    const { message, variant } = SnackController.state

    return html`<wui-toast-message message=${message} variant=${variant}></wui-toast-message> `
  }

  // -- Private ------------------------------------------- //
  private onOpen() {
    clearTimeout(this.timeout)
    if (this.open) {
      this.animate(
        [
          { opacity: 0, transform: 'scale(0.85)' },
          { opacity: 1, transform: 'scale(1)' }
        ],
        {
          duration: 150,
          fill: 'forwards',
          easing: 'ease'
        }
      )
      if (this.timeout) {
        clearTimeout(this.timeout)
      }
      this.timeout = setTimeout(() => SnackController.hide(), 2500)
    } else {
      this.animate(
        [
          { opacity: 1, transform: 'scale(1)' },
          { opacity: 0, transform: 'scale(0.85)' }
        ],
        {
          duration: 150,
          fill: 'forwards',
          easing: 'ease'
        }
      )
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-toastbar': W3mToastBar
  }
}
