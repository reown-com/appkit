import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: block;
    background: linear-gradient(120deg, rgba(0, 0, 0, 0.1) 5%, rgba(0, 0, 0, 0) 90%);
    background-size: 250%;
    animation: shimmer 3s linear infinite reverse;
    border-radius: ${({ borderRadius }) => borderRadius[2]};
  }

  :host([data-rounded='true']) {
    border-radius: ${({ borderRadius }) => borderRadius[16]};
  }
`
