import { css } from 'lit'

export default css`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    padding: var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-4);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--apkt-spacing-3);
  }

  :host > wui-flex:hover {
    background-color: var(--apkt-tokens-theme-foregroundPrimary);
  }

  .purchase-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: var(--apkt-spacing-10);
    height: var(--apkt-spacing-10);
  }

  .purchase-image-container wui-image {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: calc(var(--apkt-spacing-10) / 2);
  }

  .purchase-image-container wui-image::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: calc(var(--apkt-spacing-10) / 2);
    box-shadow: inset 0 0 0 1px var(--apkt-tokens-core-glass010);
  }

  .purchase-image-container wui-icon-box {
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate(20%, 20%);
  }
`
