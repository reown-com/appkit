import { css } from 'lit'

export default css`
  button {
    cursor: pointer;
    border-radius: var(--wui-border-radius-xxs);
    color: var(--wui-color-fg-100);
    padding: 10px;
    background-color: transparent;
    border: 1px solid transparent;
    transition: all 200ms ease-in-out;
  }

  button:disabled > wui-icon {
    color: var(--wui-color-bg-300);
  }

  button:focus {
    background-color: var(--wui-overlay-005);
    border: 1px solid var(--wui-color-blue-100);
    -webkit-box-shadow: 0px 0px 0px 4px var(--wui-box-shadow-blue);
    -moz-box-shadow: 0px 0px 0px 4px var(--wui-box-shadow-blue);
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
