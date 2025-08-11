import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    width: 100%;
  }

  button {
    padding: ${({ spacing }) => spacing[3]};
    display: flex;
    justify-content: space-between;
    width: 100%;
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    background-color: transparent;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    }
  }

  button:focus-visible:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    box-shadow: 0 0 0 4px ${({ tokens }) => tokens.core.foregroundAccent040};
  }

  button[data-clickable='false'] {
    pointer-events: none;
    background-color: transparent;
  }

  wui-image,
  wui-icon {
    width: ${({ spacing }) => spacing[10]};
    height: ${({ spacing }) => spacing[10]};
  }

  wui-image {
    border-radius: ${({ borderRadius }) => borderRadius[16]};
  }
`
