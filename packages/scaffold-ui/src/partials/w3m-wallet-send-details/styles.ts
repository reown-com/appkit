import { css } from 'lit'

export default css`
  :host {
    display: flex;
    width: auto;
    flex-direction: column;
    gap: var(--apkt-spacing-1);
    border-radius: var(--apkt-borderRadius-5);
    background: var(--apkt-tokens-theme-foregroundPrimary);
    padding: var(--apkt-spacing-3) var(--apkt-spacing-2) var(--apkt-spacing-2) var(--apkt-spacing-2);
  }

  wui-list-content {
    width: -webkit-fill-available !important;
  }

  wui-text {
    padding: 0 var(--apkt-spacing-2);
  }

  wui-flex {
    margin-top: var(--apkt-spacing-2);
  }

  .network {
    cursor: pointer;
    transition: background-color var(--apkt-duration-lg) var(--apkt-ease-out-power-1);
    will-change: background-color;
  }

  .network:focus-visible {
    border: 1px solid var(--apkt-colors-accent100);
    background-color: var(--apkt-tokens-core-glass010);
    -webkit-box-shadow: 0px 0px 0px 4px var(--apkt-tokens-core-foregroundAccent010);
    -moz-box-shadow: 0px 0px 0px 4px var(--apkt-tokens-core-foregroundAccent010);
    box-shadow: 0px 0px 0px 4px var(--apkt-tokens-core-foregroundAccent010);
  }

  .network:hover {
    background-color: var(--apkt-tokens-core-glass010);
  }

  .network:active {
    background-color: var(--apkt-tokens-core-glass010);
  }
`
