import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: flex;
    padding: ${({ spacing }) => spacing[4]} ${({ spacing }) => spacing[3]};
    width: 100%;
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
  }

  wui-image {
    width: 20px;
    height: 20px;
    border-radius: ${({ borderRadius }) => borderRadius[16]};
  }

  wui-icon {
    width: 20px;
    height: 20px;
  }
`
