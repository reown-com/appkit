import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    display: flex;
    gap: ${({ spacing }) => spacing[1]};
    padding: ${({ spacing }) => spacing[4]};
    width: 100%;
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    justify-content: center;
    align-items: center;
  }

  :host([data-size='sm']) button {
    padding: ${({ spacing }) => spacing[2]};
    border-radius: ${({ borderRadius }) => borderRadius[2]};
  }

  :host([data-size='md']) button {
    padding: ${({ spacing }) => spacing[3]};
    border-radius: ${({ borderRadius }) => borderRadius[3]};
  }

  button:hover {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }

  button:disabled {
    opacity: 0.5;
  }
`
