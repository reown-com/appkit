import { css } from 'lit'

export default css`
  :host > button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: var(--wui-color-inverse-000);
    column-gap: var(--wui-spacing-xxs);
  }

  :host > button > wui-image {
    height: var(--wui-spacing-m);
    width: var(--wui-spacing-m);
    border-radius: var(--wui-border-radius-5xs);
  }

  /* -- Variants --------------------------------------------------------- */
  :host([data-size='lg']) > button {
    padding: var(--wui-spacing-s) var(--wui-spacing-2l);
    height: var(--wui-icon-box-size-2lg);
    border-radius: var(--wui-border-radius-xs);
  }

  :host([data-size='md']) > button {
    padding: var(--wui-spacing-xs) var(--wui-spacing-m);
    height: var(--wui-icon-box-size-mdl);
    border-radius: var(--wui-border-radius-xxs);
  }

  /* -- Disabled state --------------------------------------------------- */
  :host > button:disabled {
    cursor: default;
  }
`
