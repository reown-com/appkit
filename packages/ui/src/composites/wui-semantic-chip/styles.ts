import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  a {
    border: none;
    border-radius: var(--wui-border-radius-3xl);
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: ${({ spacing }) => spacing[1]};
    transition:
      background-color 0.2s ease-in-out,
      box-shadow 0.2s ease-in-out,
      border 0.2s ease-in-out;
    will-change: background-color, box-shadow, border;
  }

  /* -- Variants --------------------------------------------------------------- */
  a[data-type='success'] {
    background-color: ${({ tokens }) => tokens.core.backgroundSuccess};
    color: ${({ tokens }) => tokens.core.textSuccess};
  }

  a[data-type='error'] {
    background-color: ${({ tokens }) => tokens.core.backgroundError};
    color: ${({ tokens }) => tokens.core.textError};
  }

  a[data-type='warning'] {
    background-color: ${({ tokens }) => tokens.core.backgroundWarning};
    color: ${({ tokens }) => tokens.core.textWarning};
  }

  /* -- Sizes --------------------------------------------------------------- */
  a[data-size='sm'] {
    height: 24px;
  }

  a[data-size='md'] {
    height: 28px;
  }

  a[data-size='lg'] {
    height: 32px;
  }

  a[data-size='sm'] > wui-image,
  a[data-size='sm'] > wui-icon {
    width: 16px;
    height: 16px;
  }

  a[data-size='md'] > wui-image,
  a[data-size='md'] > wui-icon {
    width: 20px;
    height: 20px;
  }

  a[data-size='lg'] > wui-image,
  a[data-size='lg'] > wui-icon {
    width: 24px;
    height: 24px;
  }

  wui-text {
    padding-left: ${({ spacing }) => spacing[1]};
    padding-right: ${({ spacing }) => spacing[1]};
  }

  wui-image {
    border-radius: ${({ borderRadius }) => borderRadius[3]};
    overflow: hidden;
    user-drag: none;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-drag: none;
    -webkit-user-select: none;
    -ms-user-select: none;
  }

  /* -- States --------------------------------------------------------------- */
  @media (hover: hover) and (pointer: fine) {
    a[data-type='success']:not(:disabled):hover {
      background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
      box-shadow: 0px 0px 0px 1px ${({ tokens }) => tokens.core.borderSuccess};
    }

    a[data-type='error']:not(:disabled):hover {
      background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
      box-shadow: 0px 0px 0px 1px ${({ tokens }) => tokens.core.borderError};
    }

    a[data-type='warning']:not(:disabled):hover {
      background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
      box-shadow: 0px 0px 0px 1px ${({ tokens }) => tokens.core.borderWarning};
    }
  }

  a[data-type='success']:not(:disabled):focus-visible,
  a[data-type='success']:not(:disabled):active {
    box-shadow:
      0px 0px 0px 1px ${({ tokens }) => tokens.core.backgroundAccentPrimary},
      0px 0px 0px 4px ${({ tokens }) => tokens.core.foregroundAccent020};
  }

  a[data-type='error']:not(:disabled):focus-visible,
  a[data-type='error']:not(:disabled):active {
    box-shadow:
      0px 0px 0px 1px ${({ tokens }) => tokens.core.backgroundAccentPrimary},
      0px 0px 0px 4px ${({ tokens }) => tokens.core.foregroundAccent020};
  }

  a[data-type='warning']:not(:disabled):focus-visible,
  a[data-type='warning']:not(:disabled):active {
    box-shadow:
      0px 0px 0px 1px ${({ tokens }) => tokens.core.backgroundAccentPrimary},
      0px 0px 0px 4px ${({ tokens }) => tokens.core.foregroundAccent020};
  }

  a:disabled {
    opacity: 0.5;
  }
`
