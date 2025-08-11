import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    width: 100%;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: ${({ spacing }) => spacing[3]};
    width: 100%;
    background-color: transparent;
    border-radius: ${({ borderRadius }) => borderRadius[4]};
  }

  wui-text {
    text-transform: capitalize;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    }
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
