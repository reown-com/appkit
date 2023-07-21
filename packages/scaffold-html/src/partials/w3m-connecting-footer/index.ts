import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

@customElement('w3m-connecting-footer')
export class W3mConnectingFooter extends LitElement {
  // -- State & Properties --------------------------------- //
  @property() public preference = ''

  @property({ type: Array }) public preferences: string[] = []

  @state() private selectedPreference = false

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-separator text="or try other options"></wui-separator>
      <wui-flex .padding=${['xxl', '0', 'xxl', '0'] as const} justifyContent="center" gap="xs">
        <wui-button size="sm" variant="accent">
          <wui-icon size="sm" color="inherit" slot="iconLeft" name="arrowLeft"></wui-icon>
          Mobile
        </wui-button>
        <wui-button size="sm" variant="accent">
          <wui-icon size="sm" color="inherit" slot="iconLeft" name="arrowLeft"></wui-icon>
          Web
        </wui-button>
        <wui-button size="sm" variant="accent">
          <wui-icon size="sm" color="inherit" slot="iconLeft" name="arrowLeft"></wui-icon>
          Extension
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-footer': W3mConnectingFooter
  }
}
