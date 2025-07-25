import { css } from '../../utils/ThemeHelperUtil.js'

/*
 * @TODO: Instead of using fixed height and width for wui-avatar,
 * use icon/avatar spacing variables once the become available
 */

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

  wui-flex {
    width: fit-content;
  }

  wui-icon:last-child {
    color: ${({ tokens }) => tokens.theme.textSecondary};
  }

  wui-text {
    word-break: break-all;
  }

  .avatarIcon {
    position: relative;
    margin-left: -25px;
    margin-top: 16px;
    z-index: 2;
    border: 2px solid ${({ tokens }) => tokens.theme.backgroundPrimary};
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius.round};
    padding: ${({ spacing }) => spacing[1]};
    color: ${({ tokens }) => tokens.theme.iconDefault};
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
