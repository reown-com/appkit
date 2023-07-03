import { css } from 'lit'

export default css`
  button {
    display: flex;
    column-gap: var(--wui-spacing-s);
    align-items: center;
    width: 336px;
    padding: 8px 16px 8px 8px;
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-xs);
    border: 1px solid transparent;
    transition: all 200ms ease-in-out;
    cursor: pointer;
  }

  button > wui-text:nth-child(2) {
    display: flex;
    flex: 1;
  }

  button:disabled {
    background-color: var(--wui-overlay-010);
  }

  button:disabled > wui-text:nth-child(3) {
    opacity: 0.6;
  }

  button:disabled > wui-wallet-image,
  button:disabled > wui-all-wallets-image {
    opacity: 0.3;
  }

  button:focus {
    background-color: var(--wui-overlay-005);
    border: 1px solid var(--wui-color-blue-100);
    -webkit-box-shadow: 0px 0px 0px 4px var(--wui-box-shadow-blue); /* For Safari */
    -moz-box-shadow: 0px 0px 0px 4px var(--wui-box-shadow-blue); /* For Firefox */
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
