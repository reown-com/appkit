import { css } from '@reown/appkit-ui'

export default css`
  .icon-box {
    width: 64px;
    height: 64px;
    border-radius: 16px;
    background-color: ${({ spacing }) => spacing[16]};
    border: 8px solid ${({ tokens }) => tokens.theme.borderPrimary};
    border-radius: ${({ borderRadius }) => borderRadius.round};
  }
`
