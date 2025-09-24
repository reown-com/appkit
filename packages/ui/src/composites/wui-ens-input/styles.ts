import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    position: relative;
    width: 100%;
    display: inline-block;
  }

  :host([disabled]) {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .base-name {
    position: absolute;
    right: ${({ spacing }) => spacing[4]};
    top: 50%;
    transform: translateY(-50%);
    text-align: right;
    padding: ${({ spacing }) => spacing[1]};
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    border-radius: ${({ borderRadius }) => borderRadius[1]};
  }
`
