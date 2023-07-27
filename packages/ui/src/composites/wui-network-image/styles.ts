import { css } from 'lit'

export default css`
  :host {
    position: relative;
    border-radius: inherit;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 48px;
    height: 54px;
    -webkit-clip-path: var(--wui-path-network);
    clip-path: var(--wui-path-network);
    background: var(--wui-overlay-002);
  }

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  svg > path {
    stroke: var(--local-stroke);
    stroke-width: 2px;
    transition: stroke var(--wui-ease-out-power-2) var(--wui-duration-lg);
  }

  wui-image {
    width: 100%;
    height: 100%;
  }

  wui-icon {
    transform: translateY(-5%);
    width: 24px;
    height: 24px;
  }
`
