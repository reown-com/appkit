import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    flex-direction: column;
    width: 76px;
    row-gap: ${({ spacing }) => spacing[1]};
    padding: ${({ spacing }) => spacing[3]};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[5]};
  }

  button > wui-text {
    color: ${({ tokens }) => tokens.theme.textPrimary};
    max-width: 64px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button:disabled {
    opacity: 0.2;
    cursor: not-allowed;
  }

  [data-selected='true'] {
    background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    }

    button[data-selected='true']:hover:enabled {
      background-color: ${({ tokens }) => tokens.core.foregroundAccent020};
    }
  }
`
