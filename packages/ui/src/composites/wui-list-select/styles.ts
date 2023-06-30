import { css } from 'lit'

export default css`
  button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 336px;
    padding: 8px 16px 8px 8px;
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-xs);
    border: 1px solid transparent;
    transition: all 200ms ease-in-out;
    cursor: pointer;
  }

  button:focus {
    background-color: var(--wui-overlay-005);
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

  button > div:nth-child(1) {
    display: flex;
    align-items: center;
    column-gap: var(--wui-spacing-s);
  }
`
