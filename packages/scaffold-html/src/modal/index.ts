import '@web3modal/ui'
import { initializeTheming, setColorTheme } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import styles from './styles'

@customElement('w3m-modal')
export class W3mModal extends LitElement {
  public static styles = [styles]

  public constructor() {
    super()
    initializeTheming()
    setColorTheme('dark')
  }

  public render() {
    return html`
      <wui-overlay>
        <wui-card>Hello</wui-card>
      </wui-overlay>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal': W3mModal
  }
}
