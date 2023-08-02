import type { VisualType } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

type Data = {
  images: VisualType[]
  title: string
  text: string
}

@customElement('w3m-help-widget')
export class W3mHelpWidget extends LitElement {
  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public data: Data[] = []

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" alignItems="center" gap="l">
        ${this.data.map(
          item => html`
            <wui-flex flexDirection="column" alignItems="center" gap="xl">
              <wui-flex flexDirection="row" justifyContent="center" gap="1xs">
                ${item.images.map(image => html`<wui-visual name=${image}></wui-visual>`)}
              </wui-flex>
            </wui-flex>
            <wui-flex flexDirection="column" alignItems="center" gap="xxs">
              <wui-text variant="paragraph-500" color="fg-100" align="center">
                ${item.title}
              </wui-text>
              <wui-text variant="small-500" color="fg-200" align="center">${item.text}</wui-text>
            </wui-flex>
          `
        )}
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-help-widget': W3mHelpWidget
  }
}
