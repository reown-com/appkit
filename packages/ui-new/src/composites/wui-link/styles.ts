import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    border: none;
    background: transparent;
    height: 20px;
    padding: ${({ spacing }) => spacing[2]};
    column-gap: ${({ spacing }) => spacing[1]};
    border-radius: ${({ radii }) => radii[1]};
    padding: 0 ${({ spacing }) => spacing[1]};
    border-radius: ${({ spacing }) => spacing[1]};
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent'] {
    color: ${({ tokens }) => tokens.core.textAccentPrimary};
  }

  button[data-variant='secondary'] {
    color: ${({ tokens }) => tokens.theme.textSecondary};
  }

  /* -- Focus states --------------------------------------------------- */
  button[data-variant='accent']:focus-visible:enabled {
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  button[data-variant='secondary']:focus-visible:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-variant='accent']:hover:enabled {
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
  }

  button[data-variant='secondary']:hover:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  button[data-variant='accent']:active:enabled {
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  button[data-variant='secondary']:active:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Disabled state --------------------------------------------------- */
  button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  button[data-variant='accent']:disabled {
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
  }

  button[data-variant='secondary']:disabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }
`
