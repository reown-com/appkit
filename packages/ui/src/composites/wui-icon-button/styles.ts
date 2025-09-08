import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    position: relative;
  }

  :host([fullWidth]) {
    width: 100%;
  }

  button {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  button:focus-visible {
    box-shadow: 0 0 0 4px ${({ tokens }) => tokens.core.foregroundAccent020};
  }

  @media (hover: hover) {
    button:hover:enabled {
      border-radius: ${({ borderRadius }) => borderRadius[32]};
    }
  }

  button[data-variant='accent'] {
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
  }

  button[data-variant='secondary'] {
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
  }

  button[data-size='sm'] {
    width: 28px;
    height: 28px;
    padding: ${({ spacing }) => spacing[2]};
    border-radius: ${({ borderRadius }) => borderRadius[2]};
  }

  button[data-size='md'] {
    width: 40px;
    height: 40px;
    padding: ${({ spacing }) => spacing[3]};
    border-radius: ${({ borderRadius }) => borderRadius[3]};
  }

  button[data-size='lg'] {
    width: 44px;
    height: 44px;
    padding: ${({ spacing }) => spacing[3]};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
  }

  button[data-size='sm'] wui-icon {
    width: 12px;
    height: 12px;
  }

  button[data-size='md'] wui-icon {
    width: 16px;
    height: 16px;
  }

  button[data-size='lg'] wui-icon {
    width: 20px;
    height: 20px;
  }

  button[data-full-width='true'] {
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
