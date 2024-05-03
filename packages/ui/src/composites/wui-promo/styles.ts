import { css } from 'lit'

export default css`
  button {
    display: flex;
    gap: var(--wui-spacing-3xs);
    align-items: center;
    padding: 6.25px var(--wui-spacing-xs) 7.25px var(--wui-spacing-s);
    background-color: var(--wui-gray-glass-090);
    border-radius: var(--wui-border-radius-3xl);
    border: 1px solid var(--wui-gray-glass-060);
    transition: background-color var(--wui-duration-md) var(--wui-ease-inout-power-1);
    will-change: background-color;
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: var(--wui-gray-glass-080);
    }

    button:active:enabled {
      background-color: var(--wui-gray-glass-060);
    }
  }
`
