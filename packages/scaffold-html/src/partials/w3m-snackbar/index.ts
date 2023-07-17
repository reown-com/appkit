import { SnackController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'
import styles from './styles'

// -- Helpers ------------------------------------------- //
const presets = {
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

@customElement('w3m-snackbar')
export class W3mSnackBar extends LitElement {
  public static styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private timeout?: ReturnType<typeof setTimeout> = undefined

  // -- State & Properties -------------------------------- //
  @state() private open = SnackController.state.open

  public constructor() {
    super()
    this.unsubscribe.push(SnackController.subscribeKey('open', value => (this.open = value)))
  }

  public disconnectedCallback() {
    clearTimeout(this.timeout)
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public render() {
    const { message, variant } = SnackController.state
    const preset = presets[variant]
    this.onOpen()

    return html`
      <wui-snackbar
        message=${message}
        backgroundColor=${preset.backgroundColor}
        iconColor=${preset.iconColor}
        icon=${preset.icon}
      ></wui-snackbar>
    `
  }

  // -- Private ------------------------------------------- //
  private onOpen() {
    clearTimeout(this.timeout)
    if (this.open) {
      animate(this, { opacity: 1, x: '-50%', scale: [0.85, 1] }, { duration: 0.15 })
      this.timeout = setTimeout(() => SnackController.hide(), 3000)
    } else {
      animate(this, { opacity: 0, x: '-50%', scale: [1, 0.85] }, { duration: 0.15 })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-snackbar': W3mSnackBar
  }
}
