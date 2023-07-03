import { css } from 'lit'

export default css`
  button {
    display: flex;
    flex-direction: column;
    width: 100%;
    row-gap: var(--wui-spacing-xs);
    transition: all 200ms ease-in-out;
    cursor: pointer;
    padding: 8px 0px;
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-xs);
    border: 1px solid transparent;
  }

  button > wui-text {
    color: var(--wui-color-fg-100);
  }

  button:disabled {
    background-color: var(--wui-overlay-010);
  }

  button:disabled > wui-wallet-image {
    opacity: 0.3;
  }

  button:disabled > wui-text {
    color: var(--wui-color-fg-300);
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
