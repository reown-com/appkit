import { css } from '@reown/appkit-ui-new'

export default css`
  :host {
    display: block;
    position: absolute;
    top: ${({ spacing }) => spacing[3]};
    left: ${({ spacing }) => spacing[3]};
    right: ${({ spacing }) => spacing[3]};
    opacity: 0;
  }
`
