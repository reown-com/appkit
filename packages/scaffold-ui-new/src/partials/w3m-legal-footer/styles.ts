import { css } from '@reown/appkit-ui-new'

export default css`
  a {
    text-decoration: none;
    color: ${({ tokens }) => tokens.theme.textTertiary};
    font-weight: 500;
  }
`
