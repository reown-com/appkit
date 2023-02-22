import { ModalCtrl, OptionsCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { animate, spring } from 'motion'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

type Target = HTMLElement | undefined

@customElement('w3m-modal')
export class W3mModal extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private open = false

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

  private async onOpenModalEvent() {
    // TODO(ilja) await explorer data load here
    this.toggleBodyScroll(false)
    const delay = 0.2
    await animate(this.containerEl, { y: 0 }, { duration: 0 }).finished
    animate(this.overlayEl, { opacity: [0, 1] }, { duration: 0.2, delay })
    animate(
      this.containerEl,
      UiUtil.isMobileAnimation() ? { y: ['50vh', 0] } : { scale: [0.98, 1] },
      {
        scale: { easing: spring({ velocity: 0.4 }) },
        y: { easing: spring({ mass: 0.5 }) },
        delay
      }
    )
    this.addKeyboardEvents()
    this.open = true
  }

  private async onCloseModalEvent() {
    this.toggleBodyScroll(true)
    this.removeKeyboardEvents()
    await Promise.all([
      animate(
        this.containerEl,
        UiUtil.isMobileAnimation() ? { y: [0, '50vh'] } : { scale: [1, 0.98] },
        {
          scale: { easing: spring({ velocity: 0 }) },
          y: { easing: spring({ mass: 0.5 }) }
        }
      ).finished,
      animate(this.overlayEl, { opacity: [1, 0] }, { duration: 0.2 }).finished
    ])
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

  private managedModalContextTemplate() {
    const { isStandalone } = OptionsCtrl.state

    return isStandalone
      ? null
      : html`
          <w3m-account-context></w3m-account-context>
          <w3m-network-context></w3m-network-context>
        `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-overlay': true,
      'w3m-open': this.open
    }

    return html`
      <w3m-explorer-context></w3m-explorer-context>
      <w3m-theme-context></w3m-theme-context>

      ${this.managedModalContextTemplate()}

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
