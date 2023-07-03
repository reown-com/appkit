import { css } from 'lit'

export default css`
  :host {
    position: relative;
    border-radius: var(--wui-border-radius-xxs);
    width: 40px;
    height: 40px;
    overflow: hidden;
    background: var(--wui-overlay-002);
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    gap: 2px;
    padding: 3.5px !important;
  }

  :host::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: inherit;
    border: 1px solid var(--wui-overlay-010);
    pointer-events: none;
  }

  :host > wui-wallet-image {
    width: 15px;
    height: 15px;
    border-radius: var(--wui-border-radius-4xs);
  }
`
