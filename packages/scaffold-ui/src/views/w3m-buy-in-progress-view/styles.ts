import { css } from '@reown/appkit-ui'

export default css`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-visual {
    border-radius: calc(
      ${({ borderRadius }) => borderRadius['1']} * 9 - ${({ borderRadius }) => borderRadius['3']}
    );
    position: relative;
    overflow: hidden;
  }

  wui-icon-box {
    position: absolute;
    right: calc(${({ spacing }) => spacing['1']} * -1);
    bottom: calc(${({ spacing }) => spacing['1']} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity ${({ durations }) => durations['lg']} ${({ easings }) => easings['ease-out-power-2']},
      transform ${({ durations }) => durations['lg']}
        ${({ easings }) => easings['ease-out-power-2']};
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px ${({ spacing }) => spacing['4']};
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms ${({ easings }) => easings['ease-out-power-2']} both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  wui-link {
    padding: ${({ spacing }) => spacing['01']} ${({ spacing }) => spacing['2']};
  }
`
