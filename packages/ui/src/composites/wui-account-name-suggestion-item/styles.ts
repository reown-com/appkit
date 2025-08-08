import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    width: 100%;
  }

  button {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    padding: ${({ spacing }) => spacing[4]};
  }

  .name {
    max-width: 75%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      cursor: pointer;
      background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
      border-radius: ${({ borderRadius }) => borderRadius[6]};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: default;
  }

  button:focus-visible:enabled {
    box-shadow: 0 0 0 4px ${({ tokens }) => tokens.core.foregroundAccent040};
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }
`
