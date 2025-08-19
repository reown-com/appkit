import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    align-items: center;
    column-gap: ${({ spacing }) => spacing[2]};
    padding: ${({ spacing }) => spacing[3]};
    width: 100%;
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    height: 64px;
  }

  button > wui-text {
    display: flex;
    flex: 1;
    word-break: break-all;
  }

  button > wui-image {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: ${({ borderRadius }) => borderRadius[2]};
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled,
  button:active:enabled {
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    }
  }

  /* -- Disabled state --------------------------------------------------- */
  button:disabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  button:disabled > * {
    opacity: 0.5;
  }
`
