import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    display: block;
  }

  button {
    border-radius: ${({ borderRadius }) => borderRadius[32]};
    display: flex;
    gap: ${({ spacing }) => spacing[1]};
    padding: ${({ spacing }) => spacing[1]} ${({ spacing }) => spacing[2]}
      ${({ spacing }) => spacing[1]} ${({ spacing }) => spacing[1]};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (hover: hover) {
    button:hover:enabled {
      background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    }
  }

  button[data-size='sm'] > wui-icon-box,
  button[data-size='sm'] > wui-image {
    width: 16px;
    height: 16px;
  }

  button[data-size='md'] > wui-icon-box,
  button[data-size='md'] > wui-image {
    width: 20px;
    height: 20px;
  }

  button[data-size='lg'] > wui-icon-box,
  button[data-size='lg'] > wui-image {
    width: 24px;
    height: 24px;
  }

  wui-image,
  wui-icon-box {
    border-radius: ${({ borderRadius }) => borderRadius[32]};
  }
`
