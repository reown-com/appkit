import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-list-content')
export class WuiListContent extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public imageSrc?: string = undefined

  @property() public textTitle = ''

  @property() public textValue?: string = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="paragraph-500" color=${this.textValue ? 'fg-200' : 'fg-100'}>
          ${this.textTitle}
        </wui-text>
        ${this.templateContent()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateContent() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.textTitle}></wui-image>`
    } else if (this.textValue) {
      return html` <wui-text variant="paragraph-400" color="fg-100"> ${this.textValue} </wui-text>`
    }

    return html`<wui-icon size="inherit" color="fg-200" name="networkPlaceholder"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-content': WuiListContent
  }
}
