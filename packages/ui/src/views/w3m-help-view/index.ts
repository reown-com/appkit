import { CoreHelpers, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-button'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-footer'
import '../../components/w3m-modal-header'
import {
  ARROW_UP_RIGHT_ICON,
  HELP_CHART_IMG,
  HELP_COMPAS_IMG,
  HELP_DAO_IMG,
  HELP_ETH_IMG,
  HELP_KEY_IMG,
  HELP_LOCK_IMG,
  HELP_NOUN_IMG,
  HELP_PAINTING_IMG,
  HELP_USER_IMG,
  WALLET_ICON
} from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-help-view')
export class W3mHelpView extends LitElement {
  public static styles = [global, styles]

  // -- private ------------------------------------------------------ //
  private readonly learnUrl = 'https://ethereum.org/en/wallets/'

  private onGet() {
    RouterCtrl.push('GetWallet')
  }

  private onLearnMore() {
    CoreHelpers.openHref(this.learnUrl, '_blank')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${dynamicStyles()}

      <w3m-modal-header title="What is a wallet?"></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-info-container">
          <div class="w3m-images">${HELP_CHART_IMG} ${HELP_PAINTING_IMG} ${HELP_ETH_IMG}</div>
          <w3m-text variant="medium-normal">A home for your digital assets</w3m-text>
          <w3m-text variant="small-thin" align="center" color="secondary" class="w3m-info-text">
            A wallet lets you store, send and receive digital assets like cryptocurrencies and NFTs.
          </w3m-text>
        </div>

        <div class="w3m-info-container">
          <div class="w3m-images">${HELP_KEY_IMG} ${HELP_USER_IMG} ${HELP_LOCK_IMG}</div>
          <w3m-text variant="medium-normal">One login for all of web3</w3m-text>
          <w3m-text variant="small-thin" align="center" color="secondary" class="w3m-info-text">
            Log in to any app by connecting your wallet. Say goodbye to countless passwords!
          </w3m-text>
        </div>

        <div class="w3m-info-container">
          <div class="w3m-images">${HELP_COMPAS_IMG} ${HELP_NOUN_IMG} ${HELP_DAO_IMG}</div>
          <w3m-text variant="medium-normal">Your gateway to a new web</w3m-text>
          <w3m-text variant="small-thin" align="center" color="secondary" class="w3m-info-text">
            With your wallet, you can explore and interact with DeFi, NFTs, DAOs, and much more.
          </w3m-text>
        </div>
      </w3m-modal-content>
      <w3m-modal-footer>
        <div class="w3m-footer-actions">
          <w3m-button .onClick=${this.onGet.bind(this)} .iconLeft=${WALLET_ICON}>
            Get a Wallet
          </w3m-button>
          <w3m-button
            .onClick=${this.onLearnMore.bind(this)}
            variant="ghost"
            .iconRight=${ARROW_UP_RIGHT_ICON}
          >
            Learn More
          </w3m-button>
        </div>
      </w3m-modal-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-help-view': W3mHelpView
  }
}
