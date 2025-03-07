import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { AlertController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-alertbar'

import styles from './styles.js'

// -- Helpers ------------------------------------------- //
export const presets = {
  info: {
    backgroundColor: 'fg-350',
    iconColor: 'fg-325',
    icon: 'info'
  },
  success: {
    backgroundColor: 'success-glass-reown-020',
    iconColor: 'success-125',
    icon: 'checkmark'
  },
  warning: {
    backgroundColor: 'warning-glass-reown-020',
    iconColor: 'warning-100',
    icon: 'warningCircle'
  },
  error: {
    backgroundColor: 'error-glass-reown-020',
    iconColor: 'error-125',
    icon: 'exclamationTriangle'
  }
} as const

@customElement('w3m-alertbar')
export class W3mAlertBar extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private open = AlertController.state.open

  public constructor() {
    super()
    this.onOpen(true)
    this.unsubscribe.push(
      AlertController.subscribeKey('open', val => {
        this.open = val
        this.onOpen(false)
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const { message, variant } = AlertController.state
    const preset = presets[variant as keyof typeof presets]

    return html`
      <wui-alertbar
        message=${message}
        backgroundColor=${preset?.backgroundColor}
        iconColor=${preset?.iconColor}
        icon=${preset?.icon}
      ></wui-alertbar>
    `
  }

  // -- Private ------------------------------------------- //
  private onOpen(isMounted: boolean) {
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
      this.style.cssText = `pointer-events: auto`
    } else if (!isMounted) {
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
      this.style.cssText = `pointer-events: none`
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-alertbar': W3mAlertBar
  }
}
