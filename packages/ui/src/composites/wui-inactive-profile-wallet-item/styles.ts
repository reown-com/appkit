import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  wui-image,
  .icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({ borderRadius }) => borderRadius[2]};
  }

  .right-icon {
    cursor: pointer;
  }

  .icon-box {
    position: relative;
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  .icon-badge {
    position: absolute;
    top: 18px;
    left: 23px;
    z-index: 3;
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border: 2px solid ${({ tokens }) => tokens.theme.backgroundPrimary};
    border-radius: 50%;
  }

  .icon-badge {
    width: 16px;
    height: 16px;
  }
`
