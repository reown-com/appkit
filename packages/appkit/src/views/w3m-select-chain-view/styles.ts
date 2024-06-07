import { css } from 'lit'

export default css`
  :host wui-flex {
    width: 100%;
  }

  :host > wui-flex {
    max-height: clamp(360px, 540px, 80vh);
    scrollbar-width: none;
    overflow-y: scroll;
    overflow-x: hidden;
  }

  :host > wui-flex::-webkit-scrollbar {
    display: none;
  }

  :host .connector-image {
    position: relative;
    width: var(--wui-wallet-image-size-lg);
    height: var(--wui-wallet-image-size-lg);
    border-radius: var(--wui-border-radius-m);
    overflow: hidden;
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-020);
  }

  :host .connector-image > wui-image::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: var(--wui-border-radius-m);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-010);
  }
`
