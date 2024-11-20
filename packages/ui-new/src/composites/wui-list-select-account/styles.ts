import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    align-items: center;
    column-gap: ${({ spacing }) => spacing[2]};
    padding: ${({ spacing }) => spacing[3]};
    width: 100%;
    background-color: transparent;
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    height: 64px;
  }

  wui-avatar {
    height: 40px;
    width: 40px;
    flex-shrink: 0;
  }

  wui-icon-box {
    position: relative;
    right: 15px;
    top: 15px;
    border: 2px solid ${({ tokens }) => tokens.theme.backgroundPrimary};
  }

  wui-flex:nth-child(1) {
    flex: 1;
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled,
  button:active:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    box-shadow: 0px 0px 0px 4px rgba(9, 136, 240, 0.2);
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button:hover:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  /* -- Disabled state --------------------------------------------------- */
  button:disabled {
    opacity: 0.5 !important;
    background-color: transparent;
  }
`
