import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: flex;
    flex-direction: row;
    gap: ${({ spacing }) => spacing[3]};
    width: 100%;
    border-radius: ${({ borderRadius }) => borderRadius[2]};
  }
`
