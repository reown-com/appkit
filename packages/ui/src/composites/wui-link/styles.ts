import { css } from 'lit'

export default css`
  button {
    padding: 2px 6px;
    column-gap: 4px;
    transition: all 200ms ease-in-out;
    border-radius: 8px;
    background-color: transparent;
    border: 1px solid transparent;
  }

  button:disabled > wui-text,
  button:disabled > wui-icon {
    color: var(--wui-color-bg-300);
  }

  button:focus {
    border: 1px solid var(--wui-color-blue-100);
    box-shadow: 0px 0px 0px 4px var(--wui-box-shadow-blue);
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: var(--wui-overlay-005);
    }

    button:active:enabled {
      background-color: var(--wui-overlay-010);
    }
  }
`
