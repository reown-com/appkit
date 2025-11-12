import { css } from '@reown/appkit-ui'

export default css`
  :host > wui-flex:first-child {
    width: 100%;
  }

  .icon-box {
    width: 80px;
    height: 80px;
    border-radius: ${({ borderRadius }) => borderRadius.round};
  }

  .icon-box.pending {
    background: ${({ tokens }) => tokens.core.foregroundAccent010};
  }

  .icon-box.success {
    background: ${({ tokens }) => tokens.core.backgroundSuccess};
  }

  .icon-box.error {
    background: ${({ tokens }) => tokens.core.backgroundError};
  }

  .transfer-details-container,
  .tx-hashes-container {
    width: 100%;
  }

  .details-row {
    width: 100%;
    border-radius: ${({ borderRadius }) => borderRadius[3]};
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  .token-image {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    box-shadow: 0 0 0 2px ${({ tokens }) => tokens.core.glass010};
  }

  .chain-image {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-top: ${({ spacing }) => spacing[1]};
  }

  .action-buttons {
    width: 100%;
  }

  wui-icon[name='externalLink'] {
    cursor: pointer;
    transition: opacity 0.2s;
  }

  wui-icon[name='externalLink']:hover {
    opacity: 0.7;
  }
`
