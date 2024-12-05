import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: flex;
    align-items: center;
    padding: ${({ spacing }) => spacing[3]};
    column-gap: ${({ spacing }) => spacing[2]};
    border-radius: ${({ borderRadius }) => borderRadius[5]};
    border: 1px solid ${({ tokens }) => tokens.theme.borderPrimary};
    background: ${({ tokens }) => tokens.theme.foregroundPrimary};
    box-shadow: 0px 0px 16px 0px rgba(0, 0, 0, 0.25);
    user-select: none;
  }

  wui-text {
    word-break: break-word;
    flex: 1;
  }

  wui-icon:first-child {
    border-radius: ${({ borderRadius }) => borderRadius[2]};
    padding: ${({ spacing }) => spacing[3]};
    height: 16px;
    width: 16px;
  }

  wui-icon:last-child {
    cursor: pointer;
  }

  wui-icon:last-child {
    color: ${({ tokens }) => tokens.theme.iconInverse};
  }

  /* -- Variants --------------------------------------------------------- */
  :host([variant='info']) > wui-icon:first-child {
    background: ${({ tokens }) => tokens.theme.foregroundSecondary};
    color: ${({ tokens }) => tokens.theme.iconDefault};
  }

  :host([variant='success']) > wui-icon:first-child {
    background: ${({ tokens }) => tokens.core.backgroundSuccess};
    color: ${({ tokens }) => tokens.core.borderSuccess};
  }

  :host([variant='warning']) > wui-icon:first-child {
    background: ${({ tokens }) => tokens.core.backgroundWarning};
    color: ${({ tokens }) => tokens.core.borderWarning};
  }

  :host([variant='error']) > wui-icon:first-child {
    background: ${({ tokens }) => tokens.core.backgroundError};
    color: ${({ tokens }) => tokens.core.iconError};
  }
`
