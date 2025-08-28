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
    background-color: ${({ tokens }) => tokens.theme.backgroundPrimary};
    border-radius: ${({ borderRadius }) => borderRadius[4]};
    transition:
      background-color ${({ durations }) => durations['lg']}
        ${({ easings }) => easings['ease-out-power-2']},
      scale ${({ durations }) => durations['lg']} ${({ easings }) => easings['ease-out-power-2']};
    will-change: background-color, scale;
  }

  wui-text {
    text-transform: capitalize;
  }

  wui-image {
    color: ${({ tokens }) => tokens.theme.textPrimary};
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
