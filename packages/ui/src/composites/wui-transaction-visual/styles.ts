import { css } from 'lit'

export default css`
  :host {
    display: block;
    position: relative;
    width: 40px;
    height: 40px;
  }

  wui-image {
    border-radius: var(--wui-border-radius-3xl);
    border: 1px solid var(--wui-overlay-010);
    display: block;
  }

  wui-image[data-type='minted'],
  wui-image[data-type='nftSent'],
  wui-image[data-type='bought'] {
    border-radius: var(--wui-border-radius-xs);
    order: 1px solid transparent;
  }

  wui-icon-box {
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate(20%, 20%);
  }
`
