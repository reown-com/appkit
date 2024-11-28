import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: block;
    border-radius: ${({ borderRadius }) => borderRadius[8]};
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
    overflow: hidden;
  }
`
