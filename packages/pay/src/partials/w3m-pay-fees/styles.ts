import { css } from '@reown/appkit-ui'

export default css`
  :host {
    display: block;
    width: 100%;
    min-width: 239px;
  }

  wui-image {
    border-radius: ${({ borderRadius }) => borderRadius.round};
    border: 2px solid ${({ tokens }) => tokens.theme.foregroundSecondary};
  }
`
