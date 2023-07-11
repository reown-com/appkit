import { css } from 'lit'

export default css`
  :host {
    display: block;
    position: relative;
  }

  wui-image {
    width: 48px;
    height: 48px;
    border-radius: var(--wui-border-radius-3xl);
    border: 1px solid var(--wui-overlay-010);
    display: block;
  }

  wui-image[type='minted'],
  wui-image[type='nftSent'],
  wui-image[type='bought'] {
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
