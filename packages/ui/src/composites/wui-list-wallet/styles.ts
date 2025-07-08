import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    width: 100%;
  }

  button {
    column-gap: ${({ spacing }) => spacing[2]};
    padding: ${({ spacing }) => spacing[3]};
    width: 100%;
    background-color: transparent;
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    color: ${({ tokens }) => tokens.theme.textPrimary};
  }

  button > wui-text:nth-child(2) {
    display: flex;
    flex: 1;
  }

  button:disabled {
    background-color: var(--wui-color-gray-glass-015);
    color: var(--wui-color-gray-glass-015);
  }

  button:disabled > wui-tag {
    background-color: var(--wui-color-gray-glass-010);
    color: var(--wui-color-fg-300);
  }

  wui-icon {
    color: var(--wui-color-fg-200) !important;
  }
`
