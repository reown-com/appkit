import { css } from 'lit'

export default css`
  button {
    border: 1px solid var(--wui-overlay-010);
    border-radius: var(--wui-border-radius-m);
  }

  button:disabled {
    border: 1px solid var(--wui-overlay-010);
  }

  .wui-size-sm {
    padding: 6.75px 10px 7.25px;
  }

  .wui-size-md {
    padding: 9px 16px 10px 16px;
  }

  button.wui-variant-fill {
    background-color: var(--wui-color-blue-100);
  }

  button.wui-variant-fill:disabled {
    background-color: var(--wui-overlay-020);
  }

  button.wui-variant-fill:disabled > wui-text,
  button.wui-variant-fill:disabled > wui-icon {
    color: var(--wui-color-fg-300);
  }

  button.wui-variant-transparent:disabled {
    background-color: transparent;
  }

  button.wui-variant-transparent:disabled > wui-text,
  button.wui-variant-transparent:disabled > wui-icon {
    color: var(--wui-color-bg-300);
  }

  @media (hover: hover) and (pointer: fine) {
    button.wui-variant-fill:hover:enabled {
      background-color: var(--wui-color-blue-090);
    }

    button.wui-variant-fill:active:enabled {
      background-color: var(--wui-color-blue-080);
    }
  }
`
