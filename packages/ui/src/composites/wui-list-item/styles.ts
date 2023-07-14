import { css } from 'lit'

export default css`
  button {
    column-gap: var(--wui-spacing-s);
    padding: 11px 18px 11px var(--wui-spacing-s);
    width: 100%;
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-xs);
    color: var(--wui-color-fg-250);
  }

  button > wui-flex {
    flex: 1;
  }

  button > wui-image {
    width: 32px;
    height: 32px;
    border: 2px solid var(--wui-overlay-005);
    border-radius: var(--wui-border-radius-3xl);
  }

  button > wui-icon-box[data-variant='blue'] {
    border: 2px solid var(--wui-color-blue-005);
  }

  button > wui-icon-box[data-variant='overlay'] {
    border: 2px solid var(--wui-overlay-005);
  }

  button > wui-icon {
    width: 8px;
    height: 14px;
  }

  button:disabled {
    color: var(--wui-color-fg-300);
  }
`
