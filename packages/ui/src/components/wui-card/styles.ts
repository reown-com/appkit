import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: block;
    border-radius: clamp(0px, ${({ borderRadius }) => borderRadius['8']}, 44px);
    box-shadow: 0 0 0 1px ${({ tokens }) => tokens.theme.foregroundPrimary};
    overflow: hidden;
  }
`
