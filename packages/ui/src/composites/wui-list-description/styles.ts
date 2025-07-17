import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  :host {
    width: 100%;
  }

  button {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: ${({ spacing }) => spacing[4]};
    padding: ${({ spacing }) => spacing[4]};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
  }

  button:hover:enabled {
    background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
  }
`
