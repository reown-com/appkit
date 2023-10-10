import {
  ApiController,
  EventsController,
  ModalController,
  SnackController,
  ThemeController
} from '@web3modal/core'
import { UiHelperUtil, customElement, initializeTheming } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

// -- Helpers --------------------------------------------- //
const SCROLL_LOCK = 'scroll-lock'

@customElement('w3m-modal')
export class W3mModal extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private abortController?: AbortController = undefined

  // -- State & Properties -------------------------------- //
  @state() private open = ModalController.state.open

  public constructor() {
    super()
    this.initializeTheming()
    ApiController.prefetch()
    this.unsubscribe.push(
      ModalController.subscribeKey('open', val => (val ? this.onOpen() : this.onClose()))
    )
    EventsController.sendEvent({ type: 'track', event: 'MODAL_LOADED' })
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    this.onRemoveKeyboardListener()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return this.open
      ? html`
          <wui-flex @click=${this.onOverlayClick.bind(this)}>
            <wui-card role="alertdialog" aria-modal="true" tabindex="0">
              <w3m-header></w3m-header>
              <w3m-router></w3m-router>
              <w3m-snackbar></w3m-snackbar>
            </wui-card>
          </wui-flex>
        `
      : null
  }

  // -- Private ------------------------------------------- //
  private onOverlayClick(event: PointerEvent) {
    if (event.target === event.currentTarget) {
      ModalController.close()
    }
  }

  private initializeTheming() {
    const { themeVariables, themeMode } = ThemeController.state
    const defaultThemeMode = UiHelperUtil.getColorTheme(themeMode)
    initializeTheming(themeVariables, defaultThemeMode)
  }

  private async onClose() {
    this.onScrollUnlock()
    await this.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 200,
      easing: 'ease',
      fill: 'forwards'
    }).finished
    SnackController.hide()
    this.open = false
    this.onRemoveKeyboardListener()
  }

  private async onOpen() {
    this.onScrollLock()
    this.open = true
    await this.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      easing: 'ease',
      fill: 'forwards',
      delay: 300
    }).finished
    this.onAddKeyboardListener()
  }

  private onScrollLock() {
    const styleTag = document.createElement('style')
    styleTag.dataset['w3m'] = SCROLL_LOCK
    styleTag.textContent = `
      html, body {
        touch-action: none;
        overflow: hidden;
        overscroll-behavior: contain;
      }
      w3m-modal {
        pointer-events: auto;
      }
    `
    document.head.appendChild(styleTag)
  }

  private onScrollUnlock() {
    const styleTag = document.head.querySelector(`style[data-w3m="${SCROLL_LOCK}"]`)
    if (styleTag) {
      styleTag.remove()
    }
  }

  private onAddKeyboardListener() {
    this.abortController = new AbortController()
    const card = this.shadowRoot?.querySelector('wui-card')
    card?.focus()
    window.addEventListener(
      'keydown',
      event => {
        if (event.key === 'Escape') {
          ModalController.close()
        } else if (event.key === 'Tab') {
          const { tagName } = event.target as HTMLElement
          if (tagName && !tagName.includes('W3M-') && !tagName.includes('WUI-')) {
            card?.focus()
          }
        }
      },
      this.abortController
    )
  }

  private onRemoveKeyboardListener() {
    this.abortController?.abort()
    this.abortController = undefined
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal': W3mModal
  }
}
