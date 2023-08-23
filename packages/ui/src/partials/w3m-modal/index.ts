import { ModalCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { animate } from 'motion'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

type Target = HTMLElement | undefined

@customElement('w3m-modal')
export class W3mModal extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private open = false

  @state() private active = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()

    // Subscribe to modal state
    this.unsubscribeModal = ModalCtrl.subscribe(modalState => {
      if (modalState.open) {
        this.onOpenModalEvent()
      } else {
        this.onCloseModalEvent()
      }
    })
  }

  public disconnectedCallback() {
    this.unsubscribeModal?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeModal?: () => void = undefined

  private abortController?: AbortController = undefined

  private get overlayEl() {
    return UiUtil.getShadowRootElement(this, '.w3m-overlay')
  }

  private get containerEl() {
    return UiUtil.getShadowRootElement(this, '.w3m-container')
  }

  private toggleBodyScroll(enabled: boolean) {
    const body = document.querySelector('body')
    if (body) {
      if (enabled) {
        const w3mStyles = document.getElementById('w3m-styles')
        w3mStyles?.remove()
      } else {
        document.head.insertAdjacentHTML(
          'beforeend',
          `<style id="w3m-styles">html,body{touch-action:none;overflow:hidden;overscroll-behavior:contain;}</style>`
        )
      }
    }
  }

  private onCloseModal(event: PointerEvent) {
    if (event.target === event.currentTarget) {
      ModalCtrl.close()
    }
  }

  private onOpenModalEvent() {
    this.toggleBodyScroll(false)
    this.addKeyboardEvents()
    this.open = true
    setTimeout(async () => {
      const animation = UiUtil.isMobileAnimation() ? { y: ['50vh', '0vh'] } : { scale: [0.98, 1] }
      const delay = 0.1
      const duration = 0.2
      await Promise.all([
        animate(this.overlayEl, { opacity: [0, 1] }, { delay, duration }).finished,
        animate(this.containerEl, animation, { delay, duration }).finished
      ])
      this.active = true
    }, 0)
  }

  private async onCloseModalEvent() {
    this.toggleBodyScroll(true)
    this.removeKeyboardEvents()
    const animation = UiUtil.isMobileAnimation() ? { y: ['0vh', '50vh'] } : { scale: [1, 0.98] }
    const duration = 0.2
    await Promise.all([
      animate(this.overlayEl, { opacity: [1, 0] }, { duration }).finished,
      animate(this.containerEl, animation, { duration }).finished
    ])
    this.containerEl.removeAttribute('style')
    this.active = false
    this.open = false
  }

  private addKeyboardEvents() {
    this.abortController = new AbortController()
    window.addEventListener(
      'keydown',
      event => {
        if (event.key === 'Escape') {
          ModalCtrl.close()
        } else if (event.key === 'Tab') {
          if (!(event.target as Target)?.tagName.includes('W3M-')) {
            this.containerEl.focus()
          }
        }
      },
      this.abortController
    )
    this.containerEl.focus()
  }

  private removeKeyboardEvents() {
    this.abortController?.abort()
    this.abortController = undefined
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-overlay': true,
      'w3m-active': this.active
    }

    return html`
      <w3m-explorer-context data-id="partial-modal-explorer-context"></w3m-explorer-context>
      <w3m-theme-context data-id="partial-modal-theme-context"></w3m-theme-context>
      <w3m-wc-connection-context
        data-id="partial-modal-connection-context"
      ></w3m-wc-connection-context>
      <w3m-account-context data-id="partial-modal-account-context"></w3m-account-context>
      <w3m-network-context data-id="partial-modal-network-context"></w3m-network-context>

      <div
        id="w3m-modal"
        class=${classMap(classes)}
        @click=${this.onCloseModal}
        role="alertdialog"
        aria-modal="true"
      >
        <div class="w3m-container" tabindex="0">
          ${this.open
            ? html`
                <w3m-modal-backcard></w3m-modal-backcard>
                <div class="w3m-card">
                  <w3m-modal-router></w3m-modal-router>
                  <w3m-modal-toast></w3m-modal-toast>
                </div>
              `
            : null}
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal': W3mModal
  }
}
