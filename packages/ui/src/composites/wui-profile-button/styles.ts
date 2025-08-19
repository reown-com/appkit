import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[20]};
    padding: ${({ spacing }) => spacing[2]} ${({ spacing }) => spacing[3]}
      ${({ spacing }) => spacing[2]} ${({ spacing }) => spacing[2]};
    position: relative;
  }

  wui-avatar {
    width: 32px;
    height: 32px;
  }

  wui-icon-box,
  wui-image {
    width: 16px;
    height: 16px;
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    position: absolute;
    left: 26px;
    top: 24px;
  }

  wui-image {
    outline: 2px solid ${({ tokens }) => tokens.theme.backgroundPrimary};
  }

  wui-icon-box {
    outline: 2px solid ${({ tokens }) => tokens.theme.backgroundPrimary};
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
  }
`
