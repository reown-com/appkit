import { css } from 'lit'

export default css`
  svg {
    width: 100px;
    transition: all var(--wui-ease-in-power-3) var(--wui-duration-lg);
  }

  rect {
    fill: none;
    stroke: var(--wui-color-blue-100);
    stroke-width: 4px;
    stroke-dasharray: 92, 245;
    stroke-dashoffset: 340;
    stroke-linecap: round;
    animation: dash 1s linear infinite;
  }

  @keyframes dash {
    to {
      stroke-dashoffset: 0px;
    }
  }
`
