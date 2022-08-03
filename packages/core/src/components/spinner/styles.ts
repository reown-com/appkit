import { css } from 'lit'

export default css`
  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }

  svg {
    animation: rotate 2s linear infinite;
  }

  svg circle {
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
  }
`
