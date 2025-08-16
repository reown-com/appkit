import { css } from '@reown/appkit-ui'

export default css`
  :host {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  wui-checkbox {
    padding: ${({ spacing }) => spacing['3']};
  }
  a {
    text-decoration: none;
    color: ${({ tokens }) => tokens.theme.textSecondary};
    font-weight: 500;
  }
`
