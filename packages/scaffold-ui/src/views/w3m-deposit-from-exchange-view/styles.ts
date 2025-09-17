import { css } from '@reown/appkit-ui'

export default css`
  .amount-input-container {
    border-radius: ${({ borderRadius }) => borderRadius['6']};
    border-top-right-radius: 0;
    border-top-left-radius: 0;
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    padding: ${({ spacing }) => spacing[1]};
  }

  .container {
    border-radius: 30px;
  }
`
