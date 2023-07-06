import { css } from 'lit'

export default css`
  button {
    border: 1px solid var(--wui-overlay-010);
    border-radius: var(--wui-border-radius-m);
  }

  button:disabled {
    border: 1px solid var(--wui-overlay-010);
  }

  button[size='sm'] {
    padding: 6.75px 10px 7.25px;
  }

  button[size='md'] {
    padding: 9px 16px 10px 16px;
  }

  button[variant='fill'] {
    color: var(--wui-color-inverse-100);
    background-color: var(--wui-color-blue-100);
  }

  button[variant='fill']:disabled {
    color: var(--wui-color-fg-200);
    background-color: var(--wui-overlay-020);
  }

  button[variant='shade'] {
    color: var(--wui-color-fg-200);
  }

  button[variant='accent'] {
    color: var(--wui-color-blue-100);
  }

  button[variant='shade']:disabled,
  button[variant='accent']:disabled {
    color: var(--wui-color-bg-300);
  }

  button[variant='shade']:disabled,
  button[variant='accent']:disabled {
    background-color: transparent;
    color: var(--wui-color-bg-300);
  }

  @media (hover: hover) and (pointer: fine) {
    button[variant='fill']:hover:enabled {
      background-color: var(--wui-color-blue-090);
    }

    button[variant='fill']:active:enabled {
      border: 1px solid var(--wui-overlay-010);
      background-color: var(--wui-color-blue-080);
    }
  }
`
