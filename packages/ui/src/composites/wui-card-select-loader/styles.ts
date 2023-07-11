import { css } from 'lit'

export default css`
  :host {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    row-gap: var(--wui-spacing-xs);
    padding: 8px 10px;
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-xs);
    position: relative;
  }

  wui-shimmer[data-type='network'] {
    border: none;
    width: 48px;
    height: 54px;
    -webkit-clip-path: var(--wui-path-network);
    clip-path: var(--wui-path-network);
  }

  svg {
    position: absolute;
    width: 48px;
    height: 54px;
    z-index: 1;
  }

  svg > path {
    stroke: var(--wui-overlay-010);
    stroke-width: 1px;
  }
`
