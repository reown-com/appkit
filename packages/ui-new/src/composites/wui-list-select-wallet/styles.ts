import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    align-items: center;
    column-gap: ${({ spacing }) => spacing[2]};
    padding: ${({ spacing }) => spacing[3]};
    width: 100%;
    border-radius: ${({ borderRadius }) => borderRadius[4]};
  }

  button > wui-text {
    display: flex;
    flex: 1;
    word-break: break-all;
  }

  button > wui-image {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    border-radius: ${({ borderRadius }) => borderRadius[2]};
  }

  button > wui-flex {
    width: fit-content;
  }

  /* -- Variants --------------------------------------------------- */
  :host([data-variant='primary']) > button {
    background-color: transparent;
  }

  :host([data-variant='secondary']) > button {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  /* -- Focus states --------------------------------------------------- */
  :host([data-variant='primary']) > button:focus-visible:enabled,
  :host([data-variant='primary']) > button:active:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  :host([data-variant='secondary']) > button:focus-visible:enabled,
  :host([data-variant='secondary']) > button:active:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  /* -- Hover & Active states ----------------------------------------------------------- */
  :host([data-variant='primary']) > button:hover:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  :host([data-variant='secondary']) > button:hover:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  /* -- Disabled state --------------------------------------------------- */
  :host([data-variant='primary']) > button:disabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  :host([data-variant='secondary']) > button:disabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  button:disabled > * {
    opacity: 0.5;
  }
`
