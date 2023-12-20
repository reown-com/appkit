import { css } from 'lit'

export default css`
  wui-flex {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  a {
    text-decoration: none;
    color: var(--wui-color-fg-175);
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--wui-spacing-3xs);
  }
`
