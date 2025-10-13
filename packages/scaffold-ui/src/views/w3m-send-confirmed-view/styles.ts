import { css } from '@reown/appkit-ui'

export default css`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    border: 8px solid ${({ tokens }) => tokens.theme.borderPrimary};
    border-radius: ${({ borderRadius }) => borderRadius.round};
  }
`
