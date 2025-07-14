import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  .reown-logo {
    height: var(--wui-spacing-xxl);
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
