import { css } from 'lit'

export default css`
  button {
    border: 1px solid var(--wui-overlay-010);
    border-radius: 28px;
    transition: all 200ms ease-in-out;
  }

  button:disabled {
    border: 1px solid var(--wui-overlay-010);
  }

  .wui-size-sm {
    padding: 5px 10px;
  }

  .wui-size-md {
    padding: 4px 16px 5px 16px;
  }

  .wui-variant-transparent {
    background-color: transparent;
  }

  .wui-variant-fill {
    background-color: var(--wui-color-blue-100);
  }

  .wui-variant-fill:disabled {
    background-color: var(--wui-overlay-020);
  }

  .wui-variant-fill:disabled > wui-text {
    color: var(--wui-color-fg-300);
  }

  .wui-variant-transparent:disabled > wui-text {
    color: var(--wui-color-bg-300);
  }

  @media (hover: hover) and (pointer: fine) {
    .wui-variant-transparent:hover:enabled {
      background-color: var(--wui-overlay-005);
    }

    .wui-variant-transparent:active:enabled {
      background-color: var(--wui-overlay-010);
    }

    .wui-variant-fill:hover:enabled {
      background-color: var(--wui-color-blue-090);
    }

    .wui-variant-fill:active:enabled {
      background-color: var(--wui-color-blue-080);
    }
  }
`
