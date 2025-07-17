import type { TemplateResult } from 'lit'
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { addSvg } from '../../assets/svg/add.js'
import { allWalletsSvg } from '../../assets/svg/all-wallets.js'
import { appStoreSvg } from '../../assets/svg/app-store.js'
import { appleSvg } from '../../assets/svg/apple.js'
import { arrowBottomCircleSvg } from '../../assets/svg/arrow-bottom-circle.js'
import { arrowBottomSvg } from '../../assets/svg/arrow-bottom.js'
import { arrowLeftSvg } from '../../assets/svg/arrow-left.js'
import { arrowRightSvg } from '../../assets/svg/arrow-right.js'
import { arrowTopRightSvg } from '../../assets/svg/arrow-top-right.js'
import { arrowTopSvg } from '../../assets/svg/arrow-top.js'
import { arrowClockWiseSvg } from '../../assets/svg/arrows-clock-wise.js'
import { bankSvg } from '../../assets/svg/bank.js'
import { binSvg } from '../../assets/svg/bin.js'
import { bitcoinSvg } from '../../assets/svg/bitcoin.js'
import { browserSvg } from '../../assets/svg/browser.js'
import { cardSvg } from '../../assets/svg/card.js'
import { checkmarkBoldSvg } from '../../assets/svg/checkmark-bold.js'
import { checkmarkSvg } from '../../assets/svg/checkmark.js'
import { chevronBottomSvg } from '../../assets/svg/chevron-bottom.js'
import { chevronLeftSvg } from '../../assets/svg/chevron-left.js'
import { chevronRightSvg } from '../../assets/svg/chevron-right.js'
import { chevronTopSvg } from '../../assets/svg/chevron-top.js'
import { chromeStoreSvg } from '../../assets/svg/chrome-store.js'
import { clockSvg } from '../../assets/svg/clock.js'
import { closeSvg } from '../../assets/svg/close.js'
import { coinPlaceholderSvg } from '../../assets/svg/coinPlaceholder.js'
import { compassSvg } from '../../assets/svg/compass.js'
import { copySvg } from '../../assets/svg/copy.js'
import { cursorSvg } from '../../assets/svg/cursor.js'
import { desktopSvg } from '../../assets/svg/desktop.js'
import { discordSvg } from '../../assets/svg/discord.js'
import { dollarSvg } from '../../assets/svg/dollar.js'
import { ethereumSvg } from '../../assets/svg/ethereum.js'
import { etherscanSvg } from '../../assets/svg/etherscan.js'
import { exclamationCircleSvg } from '../../assets/svg/exclamation-circle.js'
import { extensionSvg } from '../../assets/svg/extension.js'
import { externalLinkSvg } from '../../assets/svg/external-link.js'
import { facebookSvg } from '../../assets/svg/facebook.js'
import { farcasterSvg } from '../../assets/svg/farcaster.js'
import { filtersSvg } from '../../assets/svg/filters.js'
import { githubSvg } from '../../assets/svg/github.js'
import { googleSvg } from '../../assets/svg/google.js'
import { helpCircleSvg } from '../../assets/svg/help-circle.js'
import { idSvg } from '../../assets/svg/id.js'
import { imageSvg } from '../../assets/svg/image.js'
import { infoSvg } from '../../assets/svg/info.js'
import { lightbulbSvg } from '../../assets/svg/lightbulb.js'
import { mailSvg } from '../../assets/svg/mail.js'
import { mobileSvg } from '../../assets/svg/mobile.js'
import { moreSvg } from '../../assets/svg/more.js'
import { networkPlaceholderSvg } from '../../assets/svg/network-placeholder.js'
import { nftPlaceholderSvg } from '../../assets/svg/nftPlaceholder.js'
import { playStoreSvg } from '../../assets/svg/play-store.js'
import { plusSvg } from '../../assets/svg/plus.js'
import { powerSvg } from '../../assets/svg/power.js'
import { qrCodeIcon } from '../../assets/svg/qr-code.js'
import { questionMarkSvg } from '../../assets/svg/question-mark.js'
import { recycleHorizontalSvg } from '../../assets/svg/recycle-horizontal.js'
import { refreshSvg } from '../../assets/svg/refresh.js'
import { reownSvg } from '../../assets/svg/reown-logo.js'
import { sealCheckSvg } from '../../assets/svg/sealcheck.js'
import { searchSvg } from '../../assets/svg/search.js'
import { sendSvg } from '../../assets/svg/send.js'
import { signOutSvg } from '../../assets/svg/sign-out.js'
import { solanaSvg } from '../../assets/svg/solana.js'
import { spinnerSvg } from '../../assets/svg/spinner.js'
import { swapHorizontalSvg } from '../../assets/svg/swapHorizontal.js'
import { swapHorizontalBoldSvg } from '../../assets/svg/swapHorizontalBold.js'
import { swapHorizontalMediumSvg } from '../../assets/svg/swapHorizontalMedium.js'
import { swapHorizontalRoundedBoldSvg } from '../../assets/svg/swapHorizontalRoundedBold.js'
import { swapVerticalSvg } from '../../assets/svg/swapVertical.js'
import { telegramSvg } from '../../assets/svg/telegram.js'
import { threeDotsSvg } from '../../assets/svg/three-dots.js'
import { twitchSvg } from '../../assets/svg/twitch.js'
import { twitterIconSvg } from '../../assets/svg/twitterIcon.js'
import { userSvg } from '../../assets/svg/user.js'
import { verifyFilledSvg } from '../../assets/svg/verify-filled.js'
import { verifySvg } from '../../assets/svg/verify.js'
import { walletSvg } from '../../assets/svg/wallet.js'
import {
  walletConnectBrownSvg,
  walletConnectLightBrownSvg,
  walletConnectSvg
} from '../../assets/svg/walletconnect.js'
import { warningCircleSvg } from '../../assets/svg/warning-circle.js'
import { warningSvg } from '../../assets/svg/warning.js'
import { xSvg } from '../../assets/svg/x.js'
import { vars } from '../../utils/ThemeHelperUtil.js'
import { colorStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconColorType, IconSizeType, IconType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //
const svgOptions: Record<IconType, TemplateResult<2>> = {
  user: userSvg,
  add: addSvg,
  allWallets: allWalletsSvg,
  arrowBottomCircle: arrowBottomCircleSvg,
  appStore: appStoreSvg,
  apple: appleSvg,
  arrowBottom: arrowBottomSvg,
  arrowLeft: arrowLeftSvg,
  arrowRight: arrowRightSvg,
  arrowTop: arrowTopSvg,
  arrowTopRight: arrowTopRightSvg,
  arrowClockWise: arrowClockWiseSvg,
  bank: bankSvg,
  browser: browserSvg,
  card: cardSvg,
  checkmark: checkmarkSvg,
  checkmarkBold: checkmarkBoldSvg,
  sealCheck: sealCheckSvg,
  chevronBottom: chevronBottomSvg,
  chevronLeft: chevronLeftSvg,
  chevronRight: chevronRightSvg,
  chevronTop: chevronTopSvg,
  chromeStore: chromeStoreSvg,
  clock: clockSvg,
  close: closeSvg,
  compass: compassSvg,
  coinPlaceholder: coinPlaceholderSvg,
  copy: copySvg,
  cursor: cursorSvg,
  desktop: desktopSvg,
  signOut: signOutSvg,
  discord: discordSvg,
  dollar: dollarSvg,
  etherscan: etherscanSvg,
  warning: warningSvg,
  exclamationCircle: exclamationCircleSvg,
  extension: extensionSvg,
  externalLink: externalLinkSvg,
  facebook: facebookSvg,
  farcaster: farcasterSvg,
  filters: filtersSvg,
  github: githubSvg,
  google: googleSvg,
  helpCircle: helpCircleSvg,
  image: imageSvg,
  id: idSvg,
  bin: binSvg,
  lightbulb: lightbulbSvg,
  mail: mailSvg,
  mobile: mobileSvg,
  more: moreSvg,
  networkPlaceholder: networkPlaceholderSvg,
  nftPlaceholder: nftPlaceholderSvg,
  power: powerSvg,
  playStore: playStoreSvg,
  plus: plusSvg,
  qrCode: qrCodeIcon,
  questionMark: questionMarkSvg,
  recycleHorizontal: recycleHorizontalSvg,
  reown: reownSvg,
  refresh: refreshSvg,
  search: searchSvg,
  send: sendSvg,
  spinner: spinnerSvg,
  swapHorizontal: swapHorizontalSvg,
  swapHorizontalMedium: swapHorizontalMediumSvg,
  swapHorizontalBold: swapHorizontalBoldSvg,
  swapHorizontalRoundedBold: swapHorizontalRoundedBoldSvg,
  swapVertical: swapVerticalSvg,
  telegram: telegramSvg,
  threeDots: threeDotsSvg,
  twitch: twitchSvg,
  twitter: xSvg,
  twitterIcon: twitterIconSvg,
  verify: verifySvg,
  verifyFilled: verifyFilledSvg,
  wallet: walletSvg,
  walletConnect: walletConnectSvg,
  walletConnectLightBrown: walletConnectLightBrownSvg,
  walletConnectBrown: walletConnectBrownSvg,
  warningCircle: warningCircleSvg,
  x: xSvg,
  info: infoSvg,
  ethereum: ethereumSvg,
  solana: solanaSvg,
  bitcoin: bitcoinSvg
}

// -- Constants ------------------------------------------ //
export const ICON_COLOR = {
  'accent-primary': vars.tokens.core.iconAccentPrimary,
  'accent-certified': vars.tokens.core.iconAccentCertified,
  default: vars.tokens.theme.iconDefault,
  success: vars.tokens.core.iconSuccess,
  error: vars.tokens.core.iconError,
  warning: vars.tokens.core.iconWarning,
  inverse: vars.tokens.theme.iconInverse
}

@customElement('wui-icon')
export class WuiIcon extends LitElement {
  public static override styles = [resetStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: IconSizeType = 'md'

  @property() public name: IconType = 'copy'

  @property() public color: IconColorType = 'inherit'

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
      --local-width: ${`var(--wui-icon-size-${this.size});`}
      --local-color: ${this.color === 'inherit' ? 'inherit' : ICON_COLOR[this.color]}
    `

    return html`${svgOptions[this.name]}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon': WuiIcon
  }
}
