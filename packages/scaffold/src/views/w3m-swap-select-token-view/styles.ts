import { css } from 'lit'

export default css`
  :host > wui-flex:first-child {
    overflow-y: hidden;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  .token-list {
    padding-top: var(--wui-spacing-s);
    max-height: calc(512px);
    overflow-y: auto;
    -webkit-mask-image: linear-gradient(
      transparent 0px,
      transparent 8px,
      black 24px,
      black 25px,
      black 32px,
      black 100%
    );
    mask-image: linear-gradient(
      transparent 0px,
      transparent 8px,
      black 24px,
      black 25px,
      black 32px,
      black 100%
    );
    border-top-left-radius: 30px;
    border-top-right-radius: 30px;
  }
`
