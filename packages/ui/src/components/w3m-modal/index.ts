import {
  ConfigCtrl,
  CoreHelpers,
  ExplorerCtrl,
  ModalCtrl,
  OptionsCtrl,
  ToastCtrl
} from '@web3modal/core'
import { html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { animate, spring } from 'motion'
import { global, color } from '../../utils/Theme'
import ThemedElement from '../../utils/ThemedElement'
import {
  defaultWalletImages,
  getChainIcon,
  getShadowRootElement,
  isMobileAnimation,
  preloadImage
} from '../../utils/UiHelpers'
import '../w3m-modal-backcard'
import '../w3m-modal-router'
import '../w3m-modal-toast'
import styles from './styles.css'

@customElement('w3m-modal')
export class W3mModal extends ThemedElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() private open = false
  @state() private initialized = false
  @state() private preload = true

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.unsubscribeModal = ModalCtrl.subscribe(modalState => {
      if (modalState.open) this.onOpenModalEvent()
      if (!modalState.open) this.onCloseModalEvent()
    })
    if (ConfigCtrl.state.configured) this.preloadData()
    else
      this.unsubscribeConfig = ConfigCtrl.subscribe(configState => {
        if (configState.configured) this.preloadData()
      })
  }

  public disconnectedCallback() {
    super.disconnectedCallback()
    this.unsubscribeModal?.()
    this.unsubscribeConfig?.()
  }

  protected dynamicStyles() {
    const { overlay, background, foreground } = color()

    return html`<style></style>`
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeModal?: () => void = undefined
  private readonly unsubscribeConfig?: () => void = undefined

  private get overlayEl() {
    return getShadowRootElement(this, '.w3m-modal-overlay')
  }

  private get containerEl() {
    return getShadowRootElement(this, '.w3m-modal-container')
  }

  private toggleBodyScroll(enabled: boolean) {
    const [body] = document.getElementsByTagName('body')
    if (enabled) body.style.overflow = 'auto'
    else body.style.overflow = 'hidden'
  }

  private onCloseModal(event: PointerEvent) {
    if (event.target === event.currentTarget) ModalCtrl.close()
  }

  private async preloadData() {
    const { standaloneChains, chains } = OptionsCtrl.state
    if (this.preload && (standaloneChains?.length || chains?.length))
      try {
        const chainsFilter = standaloneChains?.join(',')
        await Promise.all([
          ExplorerCtrl.getPreviewWallets({
            page: 1,
            entries: 10,
            chains: chainsFilter,
            device: CoreHelpers.isMobile() ? 'mobile' : 'desktop'
          }),
          ExplorerCtrl.getRecomendedWallets()
        ])
        const walletImgs = [
          ...ExplorerCtrl.state.previewWallets,
          ...ExplorerCtrl.state.recomendedWallets
        ].map(({ image_url }) => image_url.lg)
        const defaultWalletImgs = defaultWalletImages()
        const chainsImgs = chains?.map(chain => getChainIcon(chain.id)) ?? []
        await Promise.all([
          ...walletImgs.map(async url => preloadImage(url)),
          ...defaultWalletImgs.map(async url => preloadImage(url)),
          ...chainsImgs.map(async url => preloadImage(url))
        ])
      } catch {
        ToastCtrl.openToast('Failed preloading', 'error')
      } finally {
        this.preload = false
      }
  }

  private async onOpenModalEvent() {
    await this.preloadData()
    this.toggleBodyScroll(false)
    const delay = 0.3
    animate(this.overlayEl, { opacity: [0, 1] }, { duration: 0.2, delay })
    animate(this.containerEl, isMobileAnimation() ? { y: ['50vh', 0] } : { scale: [0.98, 1] }, {
      scale: { easing: spring({ velocity: 0.4 }) },
      y: { easing: spring({ mass: 0.5 }) },
      delay
    })
    document.addEventListener('keydown', this.onKeyDown)
    this.open = true
    this.initialized = true
  }

  private async onCloseModalEvent() {
    this.toggleBodyScroll(true)
    document.removeEventListener('keydown', this.onKeyDown)
    await Promise.all([
      animate(this.containerEl, isMobileAnimation() ? { y: [0, '50vh'] } : { scale: [1, 0.98] }, {
        scale: { easing: spring({ velocity: 0 }) },
        y: { easing: spring({ mass: 0.5 }) }
      }).finished,
      animate(this.overlayEl, { opacity: [1, 0] }, { duration: 0.2 }).finished
    ])
    this.open = false
  }

  private onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') ModalCtrl.close()
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const classes = {
      'w3m-modal-overlay': true,
      'w3m-modal-open': this.open
    }

    return html`
      ${this.dynamicStyles()}

      <div
        class=${classMap(classes)}
        @click=${this.onCloseModal}
        role="alertdialog"
        aria-modal="true"
      >
        <div class="w3m-modal-container">
          ${this.initialized
            ? html`
                <w3m-modal-backcard></w3m-modal-backcard>
                <div class="w3m-modal-card">
                  ${this.open ? html`<w3m-modal-router></w3m-modal-router>` : null}
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
