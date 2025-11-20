import { css } from '@reown/appkit-ui'

export default css`
  :host {
    display: block;
    width: 100%;
  }

  .disabled-container {
    padding: ${({ spacing }) => spacing[2]};
    min-height: 168px;
  }

  wui-icon {
    width: ${({ spacing }) => spacing[8]};
    height: ${({ spacing }) => spacing[8]};
  }

  wui-flex > wui-text {
    max-width: 273px;
  }
`
