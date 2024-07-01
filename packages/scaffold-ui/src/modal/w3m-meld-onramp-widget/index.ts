import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-meld-onramp-widget')
export class W3mMeldOnrampWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled? = false

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center">
        <iframe src="https://sb.fluidmoney.xyz/"></iframe>
      </wui-flex>
    `
  }

}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-meld-onramp-widget': W3mMeldOnrampWidget
  }
}
