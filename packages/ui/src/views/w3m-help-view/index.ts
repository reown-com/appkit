import { ConfigCtrl, CoreUtil, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-help-view')
export class W3mHelpView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private readonly learnUrl = 'https://ethereum.org/en/wallets/'

  private onGet() {
    if (ConfigCtrl.state.enableExplorer) {
      RouterCtrl.push('GetWallet')
    } else {
      UiUtil.openWalletExplorerUrl()
    }
  }

  private onLearnMore() {
    CoreUtil.openHref(this.learnUrl, '_blank')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <w3m-modal-header title="What is a wallet?"></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-info-container">
          <div class="w3m-images">
            ${SvgUtil.HELP_CHART_IMG} ${SvgUtil.HELP_PAINTING_IMG} ${SvgUtil.HELP_ETH_IMG}
          </div>
          <w3m-text variant="medium-regular">A home for your digital assets</w3m-text>
          <w3m-text variant="small-thin" color="secondary" class="w3m-info-text">
            A wallet lets you store, send and receive digital assets like cryptocurrencies and NFTs.
          </w3m-text>
        </div>

        <div class="w3m-info-container">
          <div class="w3m-images">
            ${SvgUtil.HELP_KEY_IMG} ${SvgUtil.HELP_USER_IMG} ${SvgUtil.HELP_LOCK_IMG}
          </div>
          <w3m-text variant="medium-regular">One login for all of web3</w3m-text>
          <w3m-text variant="small-thin" color="secondary" class="w3m-info-text">
            Log in to any app by connecting your wallet. Say goodbye to countless passwords!
          </w3m-text>
        </div>

        <div class="w3m-info-container">
          <div class="w3m-images">
            ${SvgUtil.HELP_COMPAS_IMG} ${SvgUtil.HELP_NOUN_IMG} ${SvgUtil.HELP_DAO_IMG}
          </div>
          <w3m-text variant="medium-regular">Your gateway to a new web</w3m-text>
          <w3m-text variant="small-thin" color="secondary" class="w3m-info-text">
            With your wallet, you can explore and interact with DeFi, NFTs, DAOs, and much more.
          </w3m-text>
        </div>

        <div class="w3m-footer-actions">
          <w3m-button .onClick=${this.onGet.bind(this)} .iconLeft=${SvgUtil.WALLET_ICON}>
            Get a Wallet
          </w3m-button>
          <w3m-button
            .onClick=${this.onLearnMore.bind(this)}
            .iconRight=${SvgUtil.ARROW_UP_RIGHT_ICON}
          >
            Learn More
          </w3m-button>
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-help-view': W3mHelpView
  }
}
