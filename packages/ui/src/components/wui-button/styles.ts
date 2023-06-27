import { css } from 'lit'

export default css`
  button {
    border: 1px solid var(--wui-overlay-010);
    border-radius: 28px;
  }

  .wui-size-sm {
    padding: 5px 10px;
  }

  .wui-size-md {
    padding: 4px 16px 5px 16px;
  }

  .wui-variant-accent,
  .wui-variant-shade {
    background-color: transparent;
  }

  .wui-variant-fill {
    background-color: var(--wui-color-blue-100);
  }
`
