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

  button[data-variant='fill'] {
    color: var(--wui-color-inverse-100);
    background-color: var(--wui-color-blue-100);
  }

  button[data-variant='fill']:disabled {
    color: var(--wui-color-fg-200);
    background-color: var(--wui-overlay-020);
  }

  button[data-variant='shade'] {
    color: var(--wui-color-fg-200);
  }

  button[data-variant='accent'] {
    color: var(--wui-color-blue-100);
  }

  button[data-variant='shade']:disabled,
  button[data-variant='accent']:disabled {
    color: var(--wui-color-bg-300);
  }

  button[data-variant='shade']:disabled,
  button[data-variant='accent']:disabled {
    background-color: transparent;
    color: var(--wui-color-bg-300);
  }

  button[data-variant='fill']:focus-visible {
    background-color: var(--wui-color-blue-090);
  }

  button[data-variant='fullWidth'] {
    width: 100%;
    border-radius: var(--wui-border-radius-xs);
    height: 56px;
    border: none;
    background-color: var(--wui-overlay-002);
    color: var(--wui-color-fg-200);
  }

  @media (hover: hover) and (pointer: fine) {
    button[data-variant='fill']:hover:enabled {
      background-color: var(--wui-color-blue-090);
    }
  }

  button[data-variant='fill']:active {
    background-color: var(--wui-color-blue-080);
    border: 1px solid var(--wui-overlay-010);
  }
`
