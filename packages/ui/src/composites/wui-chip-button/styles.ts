import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    border: none;
    border-radius: var(--wui-border-radius-3xl);
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${({ spacing }) => spacing[1]};
    padding: ${({ spacing }) => spacing[2]};
  }

  /* -- Variants --------------------------------------------------------------- */
  button[data-variant='main'] {
    background-color: ${({ tokens }) => tokens.core.backgroundAccentPrimary};
    color: ${({ tokens }) => tokens.theme.textPrimary};
  }

  button[data-variant='accent'] {
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
    color: ${({ tokens }) => tokens.core.textAccentPrimary};
  }

  button[data-variant='primary'] {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    color: ${({ tokens }) => tokens.theme.textPrimary};
  }

  /* -- Icons and Images --------------------------------------------------------------- */
  button[data-size='sm'] > wui-image,
  button[data-size='sm'] > wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] > wui-image,
  button[data-size='md'] > wui-icon {
    width: 16px;
    height: 16px;
  }

  wui-image {
    border-radius: 8px;
    overflow: hidden;
  }

  /* -- States --------------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    button[data-variant='main']:not(:disabled):hover {
      background-color: ${({ tokens }) => tokens.core.foregroundAccent060};
    }

    button[data-variant='accent']:not(:disabled):hover {
      box-shadow: 0 0 0 1px ${({ tokens }) => tokens.core.borderAccentPrimary};
    }

    button[data-variant='primary']:not(:disabled):hover {
      box-shadow: 0 0 0 1px ${({ tokens }) => tokens.theme.borderSecondary};
    }
  }

  button[data-variant='main']:not(:disabled):focus-visible,
  button[data-variant='main']:not(:disabled):active {
    box-shadow: 0 0 0 4px ${({ tokens }) => tokens.core.foregroundAccent020};
  }

  button[data-variant='accent']:not(:disabled):focus-visible,
  button[data-variant='accent']:not(:disabled):active {
    box-shadow:
      0 0 0 1px ${({ tokens }) => tokens.core.borderAccentPrimary},
      0 0 0 4px ${({ tokens }) => tokens.core.foregroundAccent020};
  }

  button[data-variant='primary']:not(:disabled):focus-visible,
  button[data-variant='primary']:not(:disabled):active {
    box-shadow:
      0 0 0 1px ${({ tokens }) => tokens.theme.borderSecondary},
      0 0 0 4px ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  button:disabled {
    opacity: 0.5;
  }
`
