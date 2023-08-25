import { css } from 'lit'

export default css`
  button {
    flex-direction: column;
    width: 76px;
    row-gap: var(--wui-spacing-xs);
    padding: var(--wui-spacing-xs) var(--wui-spacing-0);
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-xs);
  }

  button > wui-text {
    color: var(--wui-color-fg-100);
    max-width: 64px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    justify-content: center;
  }

  button:disabled {
    opacity: 0.5;
  }

  button:disabled > wui-text {
    color: var(--wui-color-fg-300);
  }

  [data-selected='true'] {
    background-color: var(--wui-color-accent-020);
  }

  @media (hover: hover) and (pointer: fine) {
    [data-selected='true']:hover:enabled {
      background-color: var(--wui-color-accent-015);
    }
  }

  [data-selected='true']:active:enabled {
    background-color: var(--wui-color-accent-010);
  }
`
