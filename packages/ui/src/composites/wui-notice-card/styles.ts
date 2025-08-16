import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: block;
  }

  button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${({ spacing }) => spacing[4]};
    padding: ${({ spacing }) => spacing[3]};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
  }

  wui-flex > wui-icon {
    padding: ${({ spacing }) => spacing[2]};
    color: ${({ tokens }) => tokens.theme.textInvert};
    background-color: ${({ tokens }) => tokens.core.backgroundAccentPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[2]};
    align-items: normal;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({ tokens }) => tokens.core.foregroundAccent020};
    }
  }
`
