import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ApiController, AssetController, AssetUtil } from '@reown/appkit-core'
import styles from './styles.js'

@customElement('w3m-list-network-item')
export class WuiListNetworkItem extends LitElement {
  public static override styles = styles

  @property() public imageSrc: string | undefined

  @property() public imageId: string | undefined

  @property() public name: string | undefined

  @property() public disabled: boolean | undefined

  @property() public selected: boolean | undefined

  @property() public transparent: boolean | undefined

  public override firstUpdated() {
    const imageId = this.imageId
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const imageSrc = this.imageSrc
          const imageBlob = imageId ? AssetUtil.getNetworkImageById(imageId) : undefined
          if (imageBlob) {
            this.imageSrc = imageBlob
          } else if (!imageSrc && imageId) {
            ApiController._fetchNetworkImage(imageId).then(() => {
              this.imageSrc = AssetController.state.networkImages[imageId]
            })
          }
          observer.disconnect()
        }
      })
    })
    observer.observe(this)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button data-transparent=${this.transparent} ?disabled=${this.disabled} ontouchstart>
        <wui-flex gap="s" alignItems="center">
          ${this.templateNetworkImage()}
          <wui-text variant="paragraph-500" color="inherit">${this.name}</wui-text></wui-flex
        >
        ${this.checkmarkTemplate()}
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private checkmarkTemplate() {
    if (this.selected) {
      return html`<wui-icon size="sm" color="accent-100" name="checkmarkBold"></wui-icon>`
    }

    return null
  }

  private templateNetworkImage() {
    if (this.imageSrc) {
      return html`<wui-image size="sm" src=${this.imageSrc} name=${this.name}></wui-image>`
    }

    return html`<wui-network-image ?round=${true} size="md" name=${this.name}></wui-network-image>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-list-network-item': WuiListNetworkItem
  }
}
