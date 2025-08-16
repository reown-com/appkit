import { css } from '@reown/appkit-ui'

export default css`
  .amount-input-container {
    border-radius: ${({ borderRadius }) => borderRadius['5']};
    border-top-right-radius: 0;
    border-top-left-radius: 0;
    border-bottom: 1px solid ${({ tokens }) => tokens.core.glass010};
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
  }

  .container {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    border-radius: 30px;
  }
`
