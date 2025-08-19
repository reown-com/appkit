import { css } from '@reown/appkit-ui'

export default css`
  wui-avatar,
  wui-image {
    display: ruby;
    width: 32px;
    height: 32px;
    border-radius: ${({ borderRadius }) => borderRadius['20']};
  }

  .sendButton {
    width: 70%;
    --local-width: 100% !important;
    --local-border-radius: ${({ borderRadius }) => borderRadius['4']} !important;
  }

  .cancelButton {
    width: 30%;
    --local-width: 100% !important;
    --local-border-radius: ${({ borderRadius }) => borderRadius['4']} !important;
  }
`
