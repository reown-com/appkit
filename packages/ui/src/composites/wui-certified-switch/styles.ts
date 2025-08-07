import { css } from 'lit'

export default css`
  :host {
    height: auto;
  }

  button {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    column-gap: var(--apkt-spacing-2);
    padding: var(--apkt-spacing-2) var(--apkt-spacing-3);
    background-color: var(--apkt-tokens-theme-foregroundPrimary);
    border-radius: var(--apkt-borderRadius-4);
    box-shadow: inset 0 0 0 1px var(--apkt-tokens-theme-foregroundPrimary);
    transition: background-color var(--apkt-duration-lg) var(--apkt-ease-out-power-2);
    will-change: background-color;
    cursor: pointer;
  }

  wui-switch {
    pointer-events: none;
  }
`
