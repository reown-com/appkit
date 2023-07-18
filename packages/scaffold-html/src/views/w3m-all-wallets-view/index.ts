import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import styles from './styles'

@customElement('w3m-all-wallets-view')
export class W3mAllWalletsView extends LitElement {
  public static styles = styles

  // -- Render -------------------------------------------- //
  public render() {
    return html` Hello World `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-all-wallets-view': W3mAllWalletsView
  }
}
