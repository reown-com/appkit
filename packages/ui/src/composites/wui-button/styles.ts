import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    width: var(--local-width);
  }

  button {
    width: var(--local-width);
    white-space: nowrap;
    column-gap: ${({ spacing }) => spacing[2]};
    transition:
      scale var(--apkt-duration-lg) var(--apkt-ease-out-power-1),
      background-color var(--apkt-duration-lg) var(--apkt-ease-out-power-2),
      border-radius var(--apkt-duration-lg) var(--apkt-ease-out-power-1);
    will-change: scale, background-color, border-radius;
    cursor: pointer;
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='sm'] {
    border-radius: ${({ borderRadius }) => borderRadius[2]};
    padding: 0 ${({ spacing }) => spacing[2]};
    height: 28px;
  }

  button[data-size='md'] {
    border-radius: ${({ borderRadius }) => borderRadius[3]};
    padding: 0 ${({ spacing }) => spacing[4]};
    height: 38px;
  }

  button[data-size='lg'] {
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    padding: 0 ${({ spacing }) => spacing[5]};
    height: 48px;
  }

  /* -- Variants --------------------------------------------------------- */
  button[data-variant='accent-primary'] {
    background-color: ${({ tokens }) => tokens.core.backgroundAccentPrimary};
    color: ${({ tokens }) => tokens.theme.textInvert};
  }

  button[data-variant='accent-secondary'] {
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
    color: ${({ tokens }) => tokens.core.textAccentPrimary};
  }

  button[data-variant='neutral-primary'] {
    background-color: ${({ tokens }) => tokens.theme.backgroundInvert};
    color: ${({ tokens }) => tokens.theme.textInvert};
  }

  button[data-variant='neutral-secondary'] {
    background-color: transparent;
    border: 1px solid ${({ tokens }) => tokens.theme.borderSecondary};
    color: ${({ tokens }) => tokens.theme.textPrimary};
  }

  button[data-variant='neutral-tertiary'] {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    color: ${({ tokens }) => tokens.theme.textPrimary};
  }

  button[data-variant='error-primary'] {
    background-color: ${({ tokens }) => tokens.core.textError};
    color: ${({ tokens }) => tokens.theme.textInvert};
  }

  button[data-variant='error-secondary'] {
    background-color: ${({ tokens }) => tokens.core.backgroundError};
    color: ${({ tokens }) => tokens.core.textError};
  }

  /* -- Focus states --------------------------------------------------- */
  button[data-size='sm']:focus-visible:enabled {
    border-radius: 28px;
  }

  button[data-size='md']:focus-visible:enabled {
    border-radius: 38px;
  }

  button[data-size='lg']:focus-visible:enabled {
    border-radius: 48px;
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button[data-size='sm']:hover:enabled,
  button[data-size='sm']:active:enabled {
    border-radius: 28px;
  }

  button[data-size='md']:hover:enabled,
  button[data-size='md']:active:enabled {
    border-radius: 38px;
  }

  button[data-size='lg']:hover:enabled,
  button[data-size='lg']:active:enabled {
    border-radius: 48px;
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    opacity: 0.3;
  }
`
