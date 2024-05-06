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
import type { WuiBalance } from '../composites/wui-balance/index.js'
import type { WuiBanner } from '../composites/wui-banner/index.js'
import type { WuiButton } from '../composites/wui-button/index.js'
import type { WuiCardSelect } from '../composites/wui-card-select/index.js'
import type { WuiCardSelectLoader } from '../composites/wui-card-select-loader/index.js'
import type { WuiChip } from '../composites/wui-chip/index.js'
import type { WuiCompatibleNetwork } from '../composites/wui-compatible-network/index.js'
import type { WuiChipButton } from '../composites/wui-chip-button/index.js'
import type { WuiConnectButton } from '../composites/wui-connect-button/index.js'
import type { WuiCtaButton } from '../composites/wui-cta-button/index.js'
import type { WuiDetailsGroup } from '../composites/wui-details-group/index.js'
import type { WuiDetailsGroupItem } from '../composites/wui-details-group-item/index.js'
import type { WuiEmailInput } from '../composites/wui-email-input/index.js'
import type { WuiIconBox } from '../composites/wui-icon-box/index.js'
import type { WuiIconLink } from '../composites/wui-icon-link/index.js'
import type { WuiInputAmount } from '../composites/wui-input-amount/index.js'
import type { WuiInputElement } from '../composites/wui-input-element/index.js'
import type { WuiInputNumeric } from '../composites/wui-input-numeric/index.js'
import type { WuiInputText } from '../composites/wui-input-text/index.js'
import type { WuiLink } from '../composites/wui-link/index.js'
import type { WuiListAccordion } from '../composites/wui-list-accordion/index.js'
import type { WuiListContent } from '../composites/wui-list-content/index.js'
import type { WuiListDescription } from '../composites/wui-list-description/index.js'
import type { WuiListItem } from '../composites/wui-list-item/index.js'
import type { WuiListNetwork } from '../composites/wui-list-network/index.js'
import type { WuiListToken } from '../composites/wui-list-token/index.js'
import type { WuiListWallet } from '../composites/wui-list-wallet/index.js'
import type { WuiListWalletTransaction } from '../composites/wui-list-wallet-transaction/index.js'
import type { WuiLogo } from '../composites/wui-logo/index.js'
import type { WuiLogoSelect } from '../composites/wui-logo-select/index.js'
import type { WuiNetworkButton } from '../composites/wui-network-button/index.js'
import type { WuiNetworkImage } from '../composites/wui-network-image/index.js'
import type { WuiNoticeCard } from '../composites/wui-notice-card/index.js'
import type { WuiOnRampActivityItem } from '../composites/wui-onramp-activity-item/index.js'
import type { WuiOnRampProviderItem } from '../composites/wui-onramp-provider-item/index.js'
import type { WuiOtp } from '../composites/wui-otp/index.js'
import type { WuiPreviewItem } from '../composites/wui-preview-item/index.js'
import type { WuiProfileButton } from '../composites/wui-profile-button/index.js'
import type { WuiPromo } from '../composites/wui-promo/index.js'
import type { WuiQrCode } from '../composites/wui-qr-code/index.js'
import type { WuiSearchBar } from '../composites/wui-search-bar/index.js'
import type { WuiSnackbar } from '../composites/wui-snackbar/index.js'
import type { WuiTabs } from '../composites/wui-tabs/index.js'
import type { WuiTag } from '../composites/wui-tag/index.js'
import type { WuiTokenButton } from '../composites/wui-token-button/index.js'
import type { WuiTokenListItem } from '../composites/wui-token-list-item/index.js'
import type { WuiTooltip } from '../composites/wui-tooltip/index.js'
import type { WuiWalletFeatureButton } from '../composites/wui-wallet-feature-button/index.js'
import type { WuiTooltipTrigger } from '../composites/wui-tooltip-trigger/index.js'
import type { WuiTransactionListItem } from '../composites/wui-transaction-list-item/index.js'
import type { WuiTransactionListItemLoader } from '../composites/wui-transaction-list-item-loader/index.js'
import type { WuiTransactionVisual } from '../composites/wui-transaction-visual/index.js'
import type { WuiVisualThumbnail } from '../composites/wui-visual-thumbnail/index.js'
import type { WuiWalletImage } from '../composites/wui-wallet-image/index.js'

import type { WuiFlex } from '../layout/wui-flex/index.js'
import type { WuiGrid } from '../layout/wui-grid/index.js'
import type { WuiSeparator } from '../layout/wui-separator/index.js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomElement<E> = Partial<E & { children?: any; onClick: any }>

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // -- Components ------------------------------------------- //
      'wui-card': CustomElement<WuiCard>
      'wui-icon': CustomElement<WuiIcon>
      'wui-image': CustomElement<WuiImage>
      'wui-loading-hexagon': CustomElement<WuiLoadingHexagon>
      'wui-loading-spinner': CustomElement<WuiLoadingSpinner>
      'wui-loading-thumbnail': CustomElement<WuiLoadingThumbnail>
      'wui-shimmer': CustomElement<WuiShimmer>
      'wui-text': CustomElement<WuiText>
      'wui-visual': CustomElement<WuiVisual>
      // -- Composites ------------------------------------------- //
      'wui-account-button': CustomElement<WuiAccountButton>
      'wui-all-wallets-image': CustomElement<WuiAllWalletsImage>
      'wui-avatar': CustomElement<WuiAvatar>
      'wui-balance': CustomElement<WuiBalance>
      'wui-banner': CustomElement<WuiBanner>
      'wui-button': CustomElement<WuiButton>
      'wui-card-select-loader': CustomElement<WuiCardSelectLoader>
      'wui-card-select': CustomElement<WuiCardSelect>
      'wui-chip-button': CustomElement<WuiChipButton>
      'wui-chip': CustomElement<WuiChip>
      'wui-compatible-network': CustomElement<WuiCompatibleNetwork>
      'wui-connect-button': CustomElement<WuiConnectButton>
      'wui-cta-button': CustomElement<WuiCtaButton>
      'wui-details-group-item': CustomElement<WuiDetailsGroupItem>
      'wui-details-group': CustomElement<WuiDetailsGroup>
      'wui-email-input': CustomElement<WuiEmailInput>
      'wui-icon-box': CustomElement<WuiIconBox>
      'wui-icon-link': CustomElement<WuiIconLink>
      'wui-input-amount': CustomElement<WuiInputAmount>
      'wui-input-element': CustomElement<WuiInputElement>
      'wui-input-numeric': CustomElement<WuiInputNumeric>
      'wui-input-text': CustomElement<WuiInputText>
      'wui-link': CustomElement<WuiLink>
      'wui-list-accordion': CustomElement<WuiListAccordion>
      'wui-list-content': CustomElement<WuiListContent>
      'wui-list-description': CustomElement<WuiListDescription>
      'wui-list-item': CustomElement<WuiListItem>
      'wui-list-network': CustomElement<WuiListNetwork>
      'wui-list-token': CustomElement<WuiListToken>
      'wui-list-wallet-transaction': CustomElement<WuiListWalletTransaction>
      'wui-list-wallet': CustomElement<WuiListWallet>
      'wui-logo-select': CustomElement<WuiLogoSelect>
      'wui-logo': CustomElement<WuiLogo>
      'wui-network-button': CustomElement<WuiNetworkButton>
      'wui-network-image': CustomElement<WuiNetworkImage>
      'wui-notice-card': CustomElement<WuiNoticeCard>
      'wui-onramp-activity-item': CustomElement<WuiOnRampActivityItem>
      'wui-onramp-provider-item': CustomElement<WuiOnRampProviderItem>
      'wui-otp': CustomElement<WuiOtp>
      'wui-preview-item': CustomElement<WuiPreviewItem>
      'wui-profile-button': CustomElement<WuiProfileButton>
      'wui-promo': CustomElement<WuiPromo>
      'wui-qr-code': CustomElement<WuiQrCode>
      'wui-search-bar': CustomElement<WuiSearchBar>
      'wui-snackbar': CustomElement<WuiSnackbar>
      'wui-tabs': CustomElement<WuiTabs>
      'wui-tag': CustomElement<WuiTag>
      'wui-token-button': CustomElement<WuiTokenButton>
      'wui-token-list-item': CustomElement<WuiTokenListItem>
      'wui-wallet-feature-button': CustomElement<WuiWalletFeatureButton>
      'wui-tooltip-trigger': CustomElement<WuiTooltipTrigger>
      'wui-tooltip': CustomElement<WuiTooltip>
      'wui-transaction-list-item-loader': CustomElement<WuiTransactionListItemLoader>
      'wui-transaction-list-item': CustomElement<WuiTransactionListItem>
      'wui-transaction-visual': CustomElement<WuiTransactionVisual>
      'wui-visual-thumbnail': CustomElement<WuiVisualThumbnail>
      'wui-wallet-image': CustomElement<WuiWalletImage>
      // -- Layout ------------------------------------------- //
      'wui-flex': CustomElement<WuiFlex>
      'wui-grid': CustomElement<WuiGrid>
      'wui-separator': CustomElement<WuiSeparator>
    }
  }
}
