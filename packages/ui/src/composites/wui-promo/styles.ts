import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  button {
    display: flex;
    height: 18px;
    padding: ${({ spacing }) => spacing['01']};
    align-items: center;
    background-color: transparent;
    border-radius: ${({ borderRadius }) => borderRadius[1]};
    border: none;
    transition: background-color ${({ durations }) => durations['lg']}
      ${({ easings }) => easings['ease-out-power-2']};
    will-change: background-color;
  }

  wui-text {
    padding-left: ${({ spacing }) => spacing['01']};
    padding-right: ${({ spacing }) => spacing['01']};
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled,
    button:active:enabled {
      background-color: ${({ tokens }) => tokens.core.foregroundAccent010};
    }
  }
`
