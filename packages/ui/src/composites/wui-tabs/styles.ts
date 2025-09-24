import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: inline-flex;
    align-items: center;
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    border-radius: ${({ borderRadius }) => borderRadius[32]};
    padding: ${({ spacing }) => spacing['01']};
    box-sizing: border-box;
  }

  :host([data-size='sm']) {
    height: 26px;
  }

  :host([data-size='md']) {
    height: 36px;
  }
`
