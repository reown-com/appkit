import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    height: 32px;
    display: flex;
    align-items: center;
    gap: ${({ spacing }) => spacing[1]};
    border-radius: ${({ borderRadius }) => borderRadius[32]};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    padding: ${({ spacing }) => spacing[1]};
    padding-left: ${({ spacing }) => spacing[2]};
  }

  wui-avatar,
  wui-image {
    width: 24px;
    height: 24px;
    border-radius: ${({ borderRadius }) => borderRadius[16]};
  }

  wui-icon {
    border-radius: ${({ borderRadius }) => borderRadius[16]};
  }
`
