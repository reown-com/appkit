import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    position: relative;
    display: flex;
    width: 100%;
    height: 1px;
    background-color: ${({ tokens }) => tokens.theme.borderPrimary};
    color: ${({ tokens }) => tokens.theme.textSecondary};
    justify-content: center;
    align-items: center;
  }

  :host > wui-text {
    position: absolute;
    padding: 0px 10px;
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
  }
`
