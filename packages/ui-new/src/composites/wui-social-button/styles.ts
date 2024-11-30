import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: block;
    width: 100%;
  }

  button {
    width: 100%;
    height: 48px;
    padding: ${({ spacing }) => spacing[3]};
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    column-gap: 6px; // @TOOD: 6px is not in the design system, replace it with spacing value
  }

  wui-text {
    text-transform: capitalize;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background: ${({ tokens }) => tokens.theme.foregroundSecondary};
    border-radius: ${({ borderRadius }) => borderRadius.round};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button:hover:enabled,
  button:active:enabled {
    background: ${({ tokens }) => tokens.theme.foregroundSecondary};
    border-radius: ${({ borderRadius }) => borderRadius.round};
  }
`
