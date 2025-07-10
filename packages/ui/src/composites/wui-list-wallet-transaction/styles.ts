import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: flex;
    flex-direction: column;
    gap: ${({ spacing }) => spacing[4]};
    padding: ${({ spacing }) => spacing[4]} ${({ spacing }) => spacing[3]};
    width: 100%;
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
  }

  wui-image {
    width: 16px;
    height: 16px;
    border-radius: ${({ borderRadius }) => borderRadius[4]};
  }

  wui-icon-box {
    width: 16px;
    height: 16px;
  }
`
