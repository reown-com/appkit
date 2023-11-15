import type { WuiCard } from '../components/wui-card/index.js'
import type { WuiIcon } from '../components/wui-icon/index.js'
import type { WuiImage } from '../components/wui-image/index.js'
import type { WuiLoadingHexagon } from '../components/wui-loading-hexagon/index.js'
import type { WuiLoadingSpinner } from '../components/wui-loading-spinner/index.js'
import type { WuiLoadingThumbnail } from '../components/wui-loading-thumbnail/index.js'
import type { WuiShimmer } from '../components/wui-shimmer/index.js'
import type { WuiText } from '../components/wui-text/index.js'
import type { WuiVisual } from '../components/wui-visual/index.js'

import type { WuiAccountButton } from '../composites/wui-account-button/index.js'
import type { WuiAllWalletsImage } from '../composites/wui-all-wallets-image/index.js'
import type { WuiAvatar } from '../composites/wui-avatar/index.js'
import type { WuiButton } from '../composites/wui-button/index.js'
import type { WuiCardSelectLoader } from '../composites/wui-card-select-loader/index.js'
import type { WuiCardSelect } from '../composites/wui-card-select/index.js'
import type { WuiChip } from '../composites/wui-chip/index.js'
import type { WuiConnectButton } from '../composites/wui-connect-button/index.js'
import type { WuiCtaButton } from '../composites/wui-cta-button/index.js'
import type { WuiEmailInput } from '../composites/wui-email-input/index.js'
import type { WuiIconBox } from '../composites/wui-icon-box/index.js'
import type { WuiIconLink } from '../composites/wui-icon-link/index.js'
import type { WuiInputElement } from '../composites/wui-input-element/index.js'
import type { WuiInputNumeric } from '../composites/wui-input-numeric/index.js'
import type { WuiInputText } from '../composites/wui-input-text/index.js'
import type { WuiLink } from '../composites/wui-link/index.js'
import type { WuiListItem } from '../composites/wui-list-item/index.js'
import type { WuiTransactionListItem } from '../composites/wui-transaction-list-item/index.js'
import type { WuiTransactionListItemLoader } from '../composites/wui-transaction-list-item-loader/index.js'
import type { WuiListWallet } from '../composites/wui-list-wallet/index.js'
import type { WuiLogoSelect } from '../composites/wui-logo-select/index.js'
import type { WuiLogo } from '../composites/wui-logo/index.js'
import type { WuiNetworkButton } from '../composites/wui-network-button/index.js'
import type { WuiNetworkImage } from '../composites/wui-network-image/index.js'
import type { WuiOtp } from '../composites/wui-otp/index.js'
import type { WuiQrCode } from '../composites/wui-qr-code/index.js'
import type { WuiSearchBar } from '../composites/wui-search-bar/index.js'
import type { WuiSnackbar } from '../composites/wui-snackbar/index.js'
import type { WuiTabs } from '../composites/wui-tabs/index.js'
import type { WuiTag } from '../composites/wui-tag/index.js'
import type { WuiTooltip } from '../composites/wui-tooltip/index.js'
import type { WuiTransactionVisual } from '../composites/wui-transaction-visual/index.js'
import type { WuiVisualThumbnail } from '../composites/wui-visual-thumbnail/index.js'
import type { WuiWalletImage } from '../composites/wui-wallet-image/index.js'

import type { WuiFlex } from '../layout/wui-flex/index.js'
import type { WuiGrid } from '../layout/wui-grid/index.js'
import type { WuiSeparator } from '../layout/wui-separator/index.js'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wui-card': WuiCard
      'wui-icon': WuiIcon
      'wui-image': WuiImage
      'wui-loading-hexagon': WuiLoadingHexagon
      'wui-loading-spinner': WuiLoadingSpinner
      'wui-loading-thumbnail': WuiLoadingThumbnail
      'wui-shimmer': WuiShimmer
      'wui-text': WuiText
      'wui-visual': WuiVisual
      'wui-account-button': WuiAccountButton
      'wui-all-wallets-image': WuiAllWalletsImage
      'wui-avatar': WuiAvatar
      'wui-button': WuiButton
      'wui-card-select-loader': WuiCardSelectLoader
      'wui-card-select': WuiCardSelect
      'wui-chip': WuiChip
      'wui-connect-button': WuiConnectButton
      'wui-cta-button': WuiCtaButton
      'wui-email-input': WuiEmailInput
      'wui-icon-box': WuiIconBox
      'wui-icon-link': WuiIconLink
      'wui-input-element': WuiInputElement
      'wui-input-numeric': WuiInputNumeric
      'wui-input-text': WuiInputText
      'wui-link': WuiLink
      'wui-list-item': WuiListItem
      'wui-transaction-list-item': WuiTransactionListItem
      'wui-transaction-list-item-loader': WuiTransactionListItemLoader
      'wui-list-wallet': WuiListWallet
      'wui-logo-select': WuiLogoSelect
      'wui-logo': WuiLogo
      'wui-network-button': WuiNetworkButton
      'wui-network-image': WuiNetworkImage
      'wui-otp': WuiOtp
      'wui-qr-code': WuiQrCode
      'wui-search-bar': WuiSearchBar
      'wui-snackbar': WuiSnackbar
      'wui-tabs': WuiTabs
      'wui-tag': WuiTag
      'wui-tooltip': WuiTooltip
      'wui-transaction-visual': WuiTransactionVisual
      'wui-visual-thumbnail': WuiVisualThumbnail
      'wui-wallet-image': WuiWalletImage
      'wui-flex': WuiFlex
      'wui-grid': WuiGrid
      'wui-separator': WuiSeparator
    }
  }
}
