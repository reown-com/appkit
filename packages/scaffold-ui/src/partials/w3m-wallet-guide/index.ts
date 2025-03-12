import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { RouterController, type WalletGuideType } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-chip'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-wallet-guide')
export class W3mWalletGuide extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: -1 | boolean

  @property() public walletGuide: WalletGuideType = 'get-started'

  // -- Render -------------------------------------------- //
  public override render() {
    return this.walletGuide === 'explore'
      ? html`<wui-flex
          class="wallet-guide"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          rowGap="xs"
          data-testid="w3m-wallet-guide-explore"
        >
          <wui-text variant="small-400" color="fg-200" align="center">
            Looking for a self-custody wallet?
          </wui-text>

          <wui-flex class="chip-box">
            <wui-chip
              imageIcon="walletConnectLightBrown"
              icon="externalLink"
              variant="transparent"
              href="https://walletguide.walletconnect.network"
              title="Find one on WalletGuide"
            ></wui-chip>
          </wui-flex>
        </wui-flex>`
      : html`<wui-flex
          columnGap="4xs"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
        >
          <wui-text variant="small-400" class="title" color="fg-200"
            >Haven't got a wallet?</wui-text
          >
          <wui-link
            data-testid="w3m-wallet-guide-get-started"
            color="blue-100"
            class="get-started-link"
            @click=${this.onGetStarted}
            tabIdx=${ifDefined(this.tabIdx)}
          >
            Get started
          </wui-link>
        </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private onGetStarted() {
    RouterController.push('Create')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-guide': W3mWalletGuide
  }
}
