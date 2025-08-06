import { css } from 'lit'

export default css`
  button {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    width: 104px;
    row-gap: var(--apkt-spacing-2);
    padding: var(--apkt-spacing-3) var(--apkt-spacing-0);
    background-color: var(--apkt-tokens-theme-foregroundPrimary);
    border-radius: clamp(0px, var(--apkt-borderRadius-4), 20px);
    transition:
      color var(--apkt-duration-lg) var(--apkt-ease-out-power-1),
      background-color var(--apkt-duration-lg) var(--apkt-ease-out-power-1),
      border-radius var(--apkt-duration-lg) var(--apkt-ease-out-power-1);
    will-change: background-color, color, border-radius;
    outline: none;
    border: none;
  }

  button > wui-flex > wui-text {
    color: var(--apkt-tokens-theme-textPrimary);
    max-width: 86px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button > wui-flex > wui-text.certified {
    max-width: 66px;
  }

  button:hover:enabled {
    background-color: var(--apkt-tokens-theme-foregroundSecondary);
  }

  button:disabled > wui-flex > wui-text {
    color: var(--apkt-tokens-core-glass010);
  }

  [data-selected='true'] {
    background-color: var(--apkt-colors-accent020);
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: var(--apkt-colors-accent015);
    }
  }

  [data-selected='true']:active:enabled {
    background-color: var(--apkt-colors-accent010);
  }

  @media (max-width: 350px) {
    button {
      width: 100%;
    }
  }
`
