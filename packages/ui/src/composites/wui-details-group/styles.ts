import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: block;
    padding-left: ${({ spacing }) => spacing[3]};
    padding-right: ${({ spacing }) => spacing[3]};
    padding-top: ${({ spacing }) => spacing[4]};
    padding-bottom: ${({ spacing }) => spacing[4]};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    width: 100%;
  }
`
