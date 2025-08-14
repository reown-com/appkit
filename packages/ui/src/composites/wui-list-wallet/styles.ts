import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    width: 100%;
  }

  button {
    column-gap: ${({ spacing }) => spacing[2]};
    padding: ${({ spacing }) => spacing[3]};
    width: 100%;
    background-color: transparent;
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    color: ${({ tokens }) => tokens.theme.textPrimary};
  }

  button > wui-wallet-image {
    background: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  button > wui-text:nth-child(2) {
    display: flex;
    flex: 1;
  }

  button:hover:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  button[data-all-wallets='true'] {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  button[data-all-wallets='true']:hover:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  button:focus-visible:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    box-shadow: 0 0 0 4px ${({ tokens }) => tokens.core.foregroundAccent020};
  }

  button:disabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    opacity: 0.5;
    cursor: not-allowed;
  }

  button:disabled > wui-tag {
    background-color: ${({ tokens }) => tokens.core.glass010};
    color: ${({ tokens }) => tokens.theme.foregroundTertiary};
  }
`
