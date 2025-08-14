import { css } from '@reown/appkit-ui'

export default css`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: ${({ spacing }) => spacing['2']};
    padding: ${({ spacing }) => spacing['3']} ${({ spacing }) => spacing['0']};
    background-color: ${({ tokens }) => tokens.theme.foregroundPrimary};
    border-radius: clamp(0px, ${({ borderRadius }) => borderRadius['4']}, 20px);
    transition:
      color ${({ durations }) => durations['lg']} ${({ easings }) => easings['ease-out-power-1']},
      background-color ${({ durations }) => durations['lg']}
        ${({ easings }) => easings['ease-out-power-1']},
      border-radius ${({ durations }) => durations['lg']}
        ${({ easings }) => easings['ease-out-power-1']};
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: ${({ tokens }) => tokens.theme.textPrimary};
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: ${({ tokens }) => tokens.theme.foregroundSecondary};
    }
  }

  button:disabled > wui-flex > wui-text {
    color: ${({ tokens }) => tokens.core.glass010};
  }

  [data-selected='true'] {
    background-color: ${({ colors }) => colors.accent020};
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: ${({ colors }) => colors.accent010};
    }
  }

  [data-selected='true']:active:enabled {
    background-color: ${({ colors }) => colors.accent010};
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`
