import { css } from '@reown/appkit-ui'

export default css`
  :host {
    display: block;
  }

  wui-image {
    border-radius: ${({ borderRadius }) => borderRadius.round};
  }
`
