import { LitElement, html } from 'lit'

import { ChainController, OptionsController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-visual-thumbnail'

import styles from './styles.js'

@customElement('w3m-siwx-sign-message-thumbnails')
export class W3mSIWXSignMessageThumbnails extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private readonly dappImageUrl = OptionsController.state.metadata?.icons

  private readonly walletImageUrl = ChainController.getAccountData()?.connectedWalletInfo?.icon

  public override firstUpdated() {
    const visuals = this.shadowRoot?.querySelectorAll('wui-visual-thumbnail')

    if (visuals?.[0]) {
      this.createAnimation(visuals[0] as HTMLElement, 'translate(18px)')
    }
    if (visuals?.[1]) {
      this.createAnimation(visuals[1] as HTMLElement, 'translate(-18px)')
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-visual-thumbnail
        ?borderRadiusFull=${true}
        .imageSrc=${this.dappImageUrl?.[0]}
      ></wui-visual-thumbnail>
      <wui-visual-thumbnail .imageSrc=${this.walletImageUrl}></wui-visual-thumbnail>
    `
  }

  // -- Private ------------------------------------------- //
  private createAnimation(element: HTMLElement, translation: string) {
    element.animate([{ transform: 'translateX(0px)' }, { transform: translation }], {
      duration: 1600,
      easing: 'cubic-bezier(0.56, 0, 0.48, 1)',
      direction: 'alternate',
      iterations: Infinity
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-siwx-sign-message-thumbnails': W3mSIWXSignMessageThumbnails
  }
}
