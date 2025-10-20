import { LitElement, html } from 'lit'

import { ModalController } from '@reown/appkit-controllers'
import { customElement } from '@laughingwhales/appkit-ui'
import '@laughingwhales/appkit-ui/wui-button'
import '@laughingwhales/appkit-ui/wui-flex'
import '@laughingwhales/appkit-ui/wui-icon'
import '@laughingwhales/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-send-confirmed-view')
export class W3mSendConfirmedView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  public constructor() {
    super()
    this.unsubscribe.push(...[])
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="4"
        .padding="${['1', '3', '4', '3'] as const}"
      >
        <wui-flex justifyContent="center" alignItems="center" class="icon-box">
          <wui-icon size="xxl" color="success" name="checkmark"></wui-icon>
        </wui-flex>

        <wui-text variant="h6-medium" color="primary">You successfully sent asset</wui-text>

        <wui-button
          fullWidth
          @click=${this.onCloseClick.bind(this)}
          size="lg"
          variant="neutral-secondary"
        >
          Close
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onCloseClick() {
    ModalController.close()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-send-confirmed-view': W3mSendConfirmedView
  }
}
