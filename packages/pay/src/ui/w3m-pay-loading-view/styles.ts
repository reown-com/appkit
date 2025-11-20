import { css } from '@reown/appkit-ui'

export default css`
  :host {
    display: block;
    height: 100%;
    width: 100%;
  }

  wui-image {
    border-radius: ${({ borderRadius }) => borderRadius.round};
  }

  .token-badge-container {
    position: absolute;
    bottom: 6px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    z-index: 3;
    min-width: 105px;
  }

  .token-badge-container.loading {
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
    border: 3px solid ${({ tokens }) => tokens.theme.backgroundPrimary};
  }

  .token-badge-container.success {
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
    border: 3px solid ${({ tokens }) => tokens.theme.backgroundPrimary};
  }

  .token-image-container {
    position: relative;
  }

  .token-image {
    border-radius: ${({ borderRadius }) => borderRadius.round};
    width: 64px;
    height: 64px;
  }

  .token-image.success {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  .token-image.error {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  .token-image.loading {
    background: ${({ colors }) => colors.accent010};
  }

  .token-image wui-icon {
    width: 32px;
    height: 32px;
  }

  .token-badge {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border: 1px solid ${({ tokens }) => tokens.theme.foregroundSecondary};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
  }

  .token-badge wui-text {
    white-space: nowrap;
  }

  .payment-lifecycle-container {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-top-right-radius: ${({ borderRadius }) => borderRadius[6]};
    border-top-left-radius: ${({ borderRadius }) => borderRadius[6]};
  }

  .payment-step-badge {
    padding: ${({ spacing }) => spacing[1]} ${({ spacing }) => spacing[2]};
    border-radius: ${({ borderRadius }) => borderRadius[1]};
  }

  .payment-step-badge.loading {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  .payment-step-badge.error {
    background-color: ${({ tokens }) => tokens.core.backgroundError};
  }

  .payment-step-badge.success {
    background-color: ${({ tokens }) => tokens.core.backgroundSuccess};
  }

  .step-icon-container {
    position: relative;
    height: 40px;
    width: 40px;
    border-radius: ${({ borderRadius }) => borderRadius.round};
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  .step-icon-box {
    position: absolute;
    right: -4px;
    bottom: -1px;
    padding: 2px;
    border-radius: ${({ borderRadius }) => borderRadius.round};
    border: 2px solid ${({ tokens }) => tokens.theme.backgroundPrimary};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  .step-icon-box.success {
    background-color: ${({ tokens }) => tokens.core.backgroundSuccess};
  }
`
