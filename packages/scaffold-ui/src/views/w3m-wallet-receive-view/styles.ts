import { css } from '@reown/appkit-ui'

export default css`
  wui-compatible-network {
    margin-top: ${({ spacing }) => spacing['4']};
    width: 100%;
  }

  wui-qr-code {
    width: unset !important;
    height: unset !important;
  }

  wui-icon {
    align-items: normal;
  }
`
