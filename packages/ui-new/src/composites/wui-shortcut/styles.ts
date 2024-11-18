import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    border: none;
  }
  /* -- Sizes --------------------------------------------------- */
  button[data-size='sm'] {
    border-radius: ${({ radii }) => radii[2]};
    padding: ${({ spacing }) => spacing[3]};
  }
  button[data-size='md'] {
    border-radius: ${({ radii }) => radii[3]};
    padding: ${({ spacing }) => spacing[4]};
  }
  button[data-size='lg'] {
    border-radius: ${({ radii }) => radii[4]};
    padding: ${({ spacing }) => spacing[5]};
  }
  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent'] {
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
    color: ${({ tokens }) => tokens.core.textAccentPrimary};
  }
  button[data-variant='secondary'] {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    color: ${({ tokens }) => tokens.theme.textPrimary};
  }
  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }
  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled,
    button:active:enabled {
      border-radius: ${({ radii }) => radii[128]};
    }
    button[data-variant='secondary']:hover:enabled {
      background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    }
    button:active:enabled {
      box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
    }
  }
  /* -- Disabled state --------------------------------------------------- */
  button:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
`
