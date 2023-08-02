import { css } from 'lit'

export default css`
  :host {
    width: var(--local-width);
  }

  button {
    border: 1px solid var(--wui-overlay-010);
    border-radius: var(--wui-border-radius-m);
  }

  button:disabled {
    border: 1px solid var(--wui-overlay-010);
  }

  button[data-size='sm'] {
    padding: 6.75px 10px 7.25px;
  }

  button[data-size='md'] {
    padding: 9px var(--wui-spacing-l);
  }
`
