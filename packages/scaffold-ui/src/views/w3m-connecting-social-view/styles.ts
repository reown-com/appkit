import { css } from '@reown/appkit-ui'

export default css`
  wui-logo {
    width: 80px;
    height: 80px;
    border-radius: ${({ borderRadius }) => borderRadius['8']};
  }
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
  wui-icon-box {
    position: absolute;
    right: calc(${({ spacing }) => spacing['1']} * -1);
    bottom: calc(${({ spacing }) => spacing['1']} * -1);
    opacity: 0;
    transform: scale(0.5);
    transition: all ${({ easings }) => easings['ease-out-power-2']}
      ${({ durations }) => durations['lg']};
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
  .capitalize {
    text-transform: capitalize;
  }
`
