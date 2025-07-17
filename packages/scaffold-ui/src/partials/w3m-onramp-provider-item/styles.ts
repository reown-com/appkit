import { css } from 'lit'

export default css`
  button {
    padding: var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-4);
    border: none;
    outline: none;
    background-color: var(--apkt-tokens-theme-foregroundPrimary);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--apkt-spacing-3);
    transition: background-color var(--apkt-ease-out-power-1) var(--apkt-duration-md);
    will-change: background-color;
  }

  button:hover {
    background-color: var(--apkt-tokens-core-glass010);
  }

  .provider-image {
    width: var(--apkt-spacing-10);
    min-width: var(--apkt-spacing-10);
    height: var(--apkt-spacing-10);
    border-radius: calc(var(--apkt-borderRadius-4) - calc(var(--apkt-spacing-3) / 2));
    position: relative;
    overflow: hidden;
  }

  .provider-image::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: calc(var(--apkt-borderRadius-4) - calc(var(--apkt-spacing-3) / 2));
    box-shadow: inset 0 0 0 1px var(--apkt-tokens-core-glass010);
  }

  .network-icon {
    width: var(--apkt-spacing-3);
    height: var(--apkt-spacing-3);
    border-radius: calc(var(--apkt-spacing-3) / 2);
    overflow: hidden;
    box-shadow:
      0 0 0 3px var(--apkt-tokens-theme-foregroundPrimary),
      0 0 0 3px var(--apkt-tokens-theme-backgroundPrimary);
    transition: box-shadow var(--apkt-ease-out-power-1) var(--apkt-duration-md);
    will-change: box-shadow;
  }

  button:hover .network-icon {
    box-shadow:
      0 0 0 3px var(--apkt-tokens-core-glass010),
      0 0 0 3px var(--apkt-tokens-theme-backgroundPrimary);
  }
`
