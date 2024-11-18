import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    display: inline-flex;
    align-items: center;
    padding: ${({ spacing }) => spacing[1]} ${({ spacing }) => spacing[2]};
    column-gap: ${({ spacing }) => spacing[1]};
    color: ${({ tokens }) => tokens.theme.textSecondary};
    border-radius: ${({ borderRadius }) => borderRadius[20]};
  }
  button[data-active='true'] {
    color: ${({ tokens }) => tokens.theme.textPrimary};
    background-color: ${({ tokens }) => tokens.theme.foregroundTertiary};
  }
  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled:not([data-active='true']) {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }
  /* -- Hover & Active states ----------------------------------------------------------- */
  button:hover:enabled:not([data-active='true']),
  button:active:enabled:not([data-active='true']) {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }
`
