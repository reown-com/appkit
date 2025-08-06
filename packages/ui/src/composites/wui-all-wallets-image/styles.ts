import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    position: relative;
    border-radius: ${({ borderRadius }) => borderRadius[2]};
    width: 40px;
    height: 40px;
    overflow: hidden;
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    column-gap: ${({ spacing }) => spacing[1]};
    padding: ${({ spacing }) => spacing[1]};
  }

  :host > wui-wallet-image {
    width: 14px;
    height: 14px;
    border-radius: 2px;
  }
`
