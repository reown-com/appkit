import { css } from '@reown/appkit-ui'

export default css`
  :host > wui-flex {
    width: 100%;
    max-width: 360px;
  }

  :host > wui-flex > wui-flex {
    border-radius: ${({ borderRadius }) => borderRadius['8']};
    width: 100%;
  }

  .amounts-container {
    width: 100%;
  }
`
