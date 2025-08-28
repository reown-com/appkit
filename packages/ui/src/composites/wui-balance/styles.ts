import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  span {
    font-weight: 500;
    font-size: 38px;
    color: ${({ tokens }) => tokens.theme.textPrimary};
    line-height: 38px;
    letter-spacing: -2%;
    text-align: center;
    font-family: var(--apkt-fontFamily-regular);
  }

  .pennies {
    color: ${({ tokens }) => tokens.theme.textSecondary};
  }
`
