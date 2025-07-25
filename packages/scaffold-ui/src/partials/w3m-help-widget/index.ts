import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import type { VisualType } from '@reown/appkit-ui'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-visual'

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
      <wui-flex flexDirection="column" alignItems="center" gap="4">
        ${this.data.map(
          item => html`
            <wui-flex flexDirection="column" alignItems="center" gap="5">
              <wui-flex flexDirection="row" justifyContent="center" gap="1">
                ${item.images.map(image => html`<wui-visual size="sm" name=${image}></wui-visual>`)}
              </wui-flex>
            </wui-flex>
            <wui-flex flexDirection="column" alignItems="center" gap="1">
              <wui-text variant="md-regular" color="primary" align="center">${item.title}</wui-text>
              <wui-text variant="sm-regular" color="secondary" align="center"
                >${item.text}</wui-text
              >
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
