import { css } from 'lit'

export default css`
  :host > wui-flex {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: 40px;
    height: 40px;
    outline: 1px solid var(--wui-gray-glass-005);
    outline-offset: -1px;
    border-radius: var(--local-border-radius);
    background-color: var(--wui-gray-glass-005);
  }

  :host > wui-flex wui-image {
    display: block;
    border-radius: var(--local-border-radius);
    z-index: -1;
  }

  :host wui-icon {
    width: 20px;
    height: 20px;
  }

  :host wui-icon-box {
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate(20%, 20%);
  }

  :host .swap-images-container {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: var(--local-border-radius);
    overflow: hidden;
  }

  :host .swap-images-container.nft,
  :host wui-image.nft {
    border-radius: var(--local-border-radius);
  }

  :host .swap-images-container wui-image:first-child {
    position: absolute;
    width: 40px;
    height: 40px;
    top: 0;
    left: 0%;
    clip-path: inset(0px calc(50% + 2px) 0px 0%);
  }

  :host .swap-images-container wui-image:last-child {
    clip-path: inset(0px 0px 0px calc(50% + 2px));
  }
`
