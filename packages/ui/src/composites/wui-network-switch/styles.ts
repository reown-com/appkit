import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    border: none;
    background: transparent;
    column-gap: ${({ spacing }) => spacing[1]};
    padding: ${({ spacing }) => spacing[1]};
    border-radius: ${({ borderRadius }) => borderRadius[128]};
  }

  button > wui-icon {
    color: ${({ tokens }) => tokens.theme.iconDefault};
  }

  button > wui-image {
    border-radius: ${({ borderRadius }) => borderRadius[20]};
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    }
    button:active:enabled {
      background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
      box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
    }
  }

  /* -- Disabled state --------------------------------------------------- */
  button:disabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }
`
