import { css } from 'lit'

export default css`
  :host > wui-flex:first-child {
    overflow-y: hidden;
    overflow-x: hidden;
    scrollbar-width: none;
    scrollbar-height: none;
  }

  wui-loading-hexagon {
    position: absolute;
  }

  .search-input-container,
  .suggested-tokens-container,
  .tokens-container {
    padding-left: var(--wui-spacing-s);
    padding-right: var(--wui-spacing-s);
  }

  .search-input-container {
    padding-top: var(--wui-spacing-s);
  }

  .suggested-tokens-container {
    overflow-x: auto;
    -webkit-mask-image: linear-gradient(
      to right,
      transparent 0px,
      black 44px,
      black calc(100% - 44px),
      transparent 100%
    );
    mask-image: linear-gradient(
      to right,
      transparent 0px,
      black 44px,
      black calc(100% - 44px),
      transparent 100%
    );
  }

  .suggested-tokens-container::-webkit-scrollbar {
    display: none;
  }

  .suggested-tokens-container.scroll-start {
    -webkit-mask-image: linear-gradient(
      to right,
      black 0px,
      black calc(100% - 44px),
      transparent 100%
    );
    mask-image: linear-gradient(to right, black 0px, black calc(100% - 44px), transparent 100%);
  }

  .suggested-tokens-container.scroll-end {
    -webkit-mask-image: linear-gradient(to right, transparent 0px, black 44px, black 100%);
    mask-image: linear-gradient(to right, transparent 0px, black 44px, black 100%);
  }

  .tokens-container {
    border-top: 1px solid var(--wui-gray-glass-005);
    height: 100%;
    max-height: calc(512px);
  }

  .tokens {
    width: 100%;
    overflow-y: auto;
    -webkit-mask-image: linear-gradient(
      transparent 0px,
      black 44px,
      black calc(100% - 44px),
      transparent 100%
    );
    mask-image: linear-gradient(
      transparent 0px,
      black 44px,
      black calc(100% - 44px),
      transparent 100%
    );
  }

  .tokens.scroll-start {
    -webkit-mask-image: linear-gradient(black 0px, black calc(100% - 44px), transparent 100%);
    mask-image: linear-gradient(black 0px, black calc(100% - 44px), transparent 100%);
  }

  .tokens.scroll-end {
    -webkit-mask-image: linear-gradient(transparent 0px, black 44px, black 100%);
    mask-image: linear-gradient(transparent 0px, black 44px, black 100%);
  }

  .network-search-input,
  .select-network-button {
    height: 40px;
  }

  .select-network-button {
    border: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: var(--wui-spacing-xs);
    box-shadow: inset 0 0 0 1px var(--wui-gray-glass-005);
    background-color: transparent;
    border-radius: var(--wui-border-radius-xxs);
    padding: var(--wui-spacing-xs);
    align-items: center;
    transition: background-color 0.2s linear;
  }

  .select-network-button:hover {
    background-color: var(--wui-gray-glass-002);
  }

  .select-network-button > wui-image {
    width: 26px;
    height: 26px;
    border-radius: var(--wui-border-radius-xs);
    box-shadow: inset 0 0 0 1px var(--wui-gray-glass-010);
  }
`
