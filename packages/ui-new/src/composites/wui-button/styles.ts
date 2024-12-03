import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    width: var(--local-width);
  }

  button {
    width: var(--local-width);
    white-space: nowrap;
    column-gap: ${({ spacing }) => spacing[2]};
  }

  /* -- Sizes --------------------------------------------------- */
  button[data-size='sm'] {
    border-radius: ${({ borderRadius }) => borderRadius[2]};
    padding: 0 ${({ spacing }) => spacing[2]};
    height: 24px;
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

  button[data-variant='error-primary'] {
    background-color: ${({ tokens }) => tokens.core.textError};
    color: ${({ tokens }) => tokens.theme.textInvert};
  }

  button[data-variant='error-secondary'] {
    background-color: ${({ tokens }) => tokens.core.backgroundError};
    color: ${({ tokens }) => tokens.core.textError};
  }

  /* -- Focus states --------------------------------------------------- */
  button:focus-visible:enabled {
    border-radius: ${({ borderRadius }) => borderRadius[128]};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  button:hover:enabled,
  button:active:enabled {
    border-radius: ${({ borderRadius }) => borderRadius[128]};
  }

  /* -- Disabled states --------------------------------------------------- */
  button:disabled {
    opacity: 0.3;
  }
`
