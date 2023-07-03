import { css } from 'lit'

export default css`
  button {
    border: 1px solid var(--wui-overlay-010);
    border-radius: var(--wui-border-radius-m);
    transition: all 200ms ease-in-out;
    column-gap: var(--wui-spacing-3xs);
  }

  button:disabled {
    border: 1px solid var(--wui-overlay-010);
  }

  button:focus {
    -webkit-box-shadow: 0px 0px 0px 4px var(--wui-box-shadow-blue);
    -moz-box-shadow: 0px 0px 0px 4px var(--wui-box-shadow-blue);
    box-shadow: 0px 0px 0px 4px var(--wui-box-shadow-blue);
  }

  .wui-size-sm {
    padding: 6.75px 10px 7.25px;
  }

  .wui-size-md {
    padding: 9px 16px 10px 16px;
  }

  .wui-variant-transparent {
    background-color: transparent;
  }

  .wui-variant-transparent:focus {
    border: 1px solid var(--wui-color-blue-100);
  }

  .wui-variant-fill {
    background-color: var(--wui-color-blue-100);
  }

  .wui-variant-fill:disabled {
    background-color: var(--wui-overlay-020);
  }

  .wui-variant-fill:disabled > wui-text,
  .wui-variant-fill:disabled > wui-icon {
    color: var(--wui-color-fg-300);
  }

  .wui-variant-transparent:disabled > wui-text,
  .wui-variant-transparent:disabled > wui-icon {
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
