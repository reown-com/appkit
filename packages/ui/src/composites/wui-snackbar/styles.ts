import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: flex;
    align-items: center;
    gap: ${({ spacing }) => spacing[1]};
    padding: ${({ spacing }) => spacing[2]} ${({ spacing }) => spacing[3]} ${({ spacing }) => spacing[2]} ${({ spacing }) => spacing[2]};
    border-radius: ${({ borderRadius }) => borderRadius[20]};
    border: 1px solid ${({ tokens }) => tokens.theme.borderPrimary};
    box-shadow: 0px 0px 12px 0px rgba(0, 0, 0, 0.25);
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
  }

  wui-icon-box {
    border-radius: ${({ borderRadius }) => borderRadius.round} !important;
  }

  wui-loading-spinner {
    padding: ${({ spacing }) => spacing[1]};
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
    border-radius: ${({ borderRadius }) => borderRadius.round} !important;
  }
`
