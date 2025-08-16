import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    border: none;
    border-radius: ${({ borderRadius }) => borderRadius['20']};
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: ${({ spacing }) => spacing[1]};
    padding: ${({ spacing }) => spacing[2]};
  }

  /* -- Variants --------------------------------------------------------------- */
  button[data-variant='success'] {
    background-color: ${({ tokens }) => tokens.core.backgroundSuccess};
    color: ${({ tokens }) => tokens.core.textSuccess};
  }

  button[data-variant='warning'] {
    background-color: ${({ tokens }) => tokens.core.backgroundWarning};
    color: ${({ tokens }) => tokens.core.textWarning};
  }

  button[data-variant='error'] {
    background-color: ${({ tokens }) => tokens.core.backgroundError};
    color: ${({ tokens }) => tokens.core.textError};
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
    button[data-variant='success']:hover {
      box-shadow: 0 0 0 1px ${({ tokens }) => tokens.core.borderSuccess};
    }

    button[data-variant='warning']:hover {
      box-shadow: 0 0 0 1px ${({ tokens }) => tokens.core.borderWarning};
    }

    button[data-variant='active']:hover {
      box-shadow: 0 0 0 1px ${({ tokens }) => tokens.core.borderError};
    }
  }

  button[data-variant='success']:focus-visible,
  button[data-variant='success']:active {
    box-shadow:
      0 0 0 1px ${({ tokens }) => tokens.core.borderSuccess},
      0 0 0 4px ${({ tokens }) => tokens.core.foregroundAccent010};
  }

  button[data-variant='warning']:focus-visible,
  button[data-variant='warning']:active {
    box-shadow:
      0 0 0 1px ${({ tokens }) => tokens.core.borderWarning},
      0 0 0 4px ${({ tokens }) => tokens.core.foregroundAccent010};
  }

  button[data-variant='error']:focus-visible,
  button[data-variant='error']:active {
    box-shadow:
      0 0 0 1px ${({ tokens }) => tokens.core.borderError},
      0 0 0 4px ${({ tokens }) => tokens.core.foregroundAccent010};
  }

  button:disabled {
    opacity: 0.5;
  }
`
