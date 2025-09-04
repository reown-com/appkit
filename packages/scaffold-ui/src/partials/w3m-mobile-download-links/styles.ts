import { css } from '@reown/appkit-ui'

export default css`
  :host {
    display: block;
    padding: 0 ${({ spacing }) => spacing['5']} ${({ spacing }) => spacing['5']};
  }
`
