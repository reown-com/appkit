import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    position: relative;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  wui-tooltip {
    padding: 7px var(--wui-spacing-s) 8px var(--wui-spacing-s);
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translate(-50%, -100%);
    opacity: 0;
    display: none;
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='xs'] {
    border-radius: ${({ borderRadius }) => borderRadius[1]};
    padding: ${({ spacing }) => spacing[2]};
    height: 20px;
    width: 20px;
  }

  button[data-size='xs'] > wui-icon {
    height: 12px;
    width: 12px;
  }

  button[data-size='sm'] {
    border-radius: ${({ borderRadius }) => borderRadius[2]};
    padding: ${({ spacing }) => spacing[2]};
    height: 24px;
    width: 24px;
  }

  button[data-size='sm'] > wui-icon {
    height: 16px;
    width: 16px;
  }

  button[data-size='md'] {
    border-radius: ${({ borderRadius }) => borderRadius[2]};
    padding: ${({ spacing }) => spacing[2]};
    height: 28px;
    width: 28px;
  }

  button[data-size='md'] > wui-icon {
    height: 20px;
    width: 20px;
  }

  button[data-size='lg'] {
    border-radius: ${({ borderRadius }) => borderRadius[3]};
    padding: ${({ spacing }) => spacing[5]};
    height: 32px;
    width: 32px;
  }

  button[data-size='lg'] > wui-icon {
    height: 24px;
    width: 24px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='neutral-primary'],
  button[data-variant='neutral-secondary'] {
    background-color: transparent;
  }

  button[data-variant='neutral-primary'] {
    color: ${({ tokens }) => tokens.theme.iconInverse};
  }

  button[data-variant='neutral-secondary'] {
    color: ${({ tokens }) => tokens.theme.iconDefault};
  }

  button[data-variant='neutral-primary']:not([disabled]):hover,
  button[data-variant='neutral-primary']:not([disabled]):active,
  button[data-variant='neutral-secondary']:not([disabled]):hover,
  button[data-variant='neutral-secondary']:not([disabled]):active {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  button[data-variant='accent-primary'] {
    background-color: transparent;
    color: ${({ tokens }) => tokens.core.iconAccentPrimary};
  }

  button[data-variant='accent-primary']:not([disabled]):hover {
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
    color: ${({ tokens }) => tokens.core.textAccentPrimary};
  }

  button:not([disabled]):active,
  button:not([disabled]):focus-visible {
    box-shadow: 0 0 0 4px ${({ tokens }) => tokens.core.foregroundAccent020};
  }

  button:not([disabled]):disabled {
    opacity: 0.5;
  }
`
