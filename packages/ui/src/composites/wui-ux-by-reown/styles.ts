import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  .reown-logo {
    height: 24px;
  }

  a {
    text-decoration: none;
    cursor: pointer;
    color: ${({ tokens }) => tokens.theme.textSecondary};
  }

  a:hover {
    opacity: 0.9;
  }
`
