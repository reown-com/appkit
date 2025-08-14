import { css } from '@reown/appkit-ui'

export default css`
  :host {
    display: block;
  }

  wui-flex {
    position: relative;
  }

  wui-icon-box {
    width: 32px;
    height: 32px;
    border-radius: ${({ borderRadius }) => borderRadius['10']} !important;
    border: 4px solid ${({ tokens }) => tokens.theme.backgroundPrimary};
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
  }

  wui-button {
    --local-border-radius: ${({ borderRadius }) => borderRadius['4']} !important;
  }

  .inputContainer {
    height: fit-content;
  }
`
