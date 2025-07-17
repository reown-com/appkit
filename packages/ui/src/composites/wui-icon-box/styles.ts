import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: var(--local-bg-color);
    border-radius: ${({ borderRadius }) => borderRadius[2]};
    padding: ${({ spacing }) => spacing[1]} !important;
  }

  :host([data-padding='2']) {
    padding: ${({ spacing }) => spacing[2]} !important;
  }

  :host > wui-icon {
    color: var(--local-icon-color);
  }

  /* -- Colors --------------------------------------------------- */
  :host([data-color='accent-primary']) {
    color: ${({ tokens }) => tokens.core.iconAccentPrimary};
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
  }

  :host([data-color='accent-certified']) {
    color: ${({ tokens }) => tokens.core.iconAccentCertified};
    background-color: transparent; // Assuming no specific background color is defined
  }

  :host([data-color='default']) {
    color: ${({ tokens }) => tokens.theme.iconDefault};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  :host([data-color='success']) {
    color: ${({ tokens }) => tokens.core.iconSuccess};
    background-color: ${({ tokens }) => tokens.core.backgroundSuccess};
  }

  :host([data-color='error']) {
    color: ${({ tokens }) => tokens.core.iconError};
    background-color: ${({ tokens }) => tokens.core.backgroundError};
  }

  :host([data-color='warning']) {
    color: ${({ tokens }) => tokens.core.iconWarning};
    background-color: ${({ tokens }) => tokens.core.backgroundWarning};
  }

  :host([data-color='inverse']) {
    color: ${({ tokens }) => tokens.theme.iconInverse};
    background-color: transparent; // Assuming no specific background color is defined
  }
`
