import { css } from 'lit'

export default css`
  :host {
    font-style: normal;
    font-family: var(--wui-font-family);
    font-feature-settings: var(--wui-font-feature-settings);
    line-height: 130%;
    font-weight: var(--wui-font-weight-regular);
    letter-spacing: var(--wui-letter-spacing-md);
  }

  .wui-font-large-500,
  .wui-font-large-600,
  .wui-font-large-700 {
    font-size: var(--wui-font-size-large);
  }

  .wui-font-paragraph-500,
  .wui-font-paragraph-600,
  .wui-font-paragraph-700 {
    font-size: var(--wui-font-size-paragraph);
  }

  .wui-font-small-500,
  .wui-font-small-600 {
    font-size: var(--wui-font-size-small);
  }

  .wui-font-tiny-500,
  .wui-font-tiny-600 {
    font-size: var(--wui-font-size-tiny);
  }

  .wui-font-micro-500,
  .wui-font-micro-600 {
    font-size: var(--wui-font-size-micro);
    letter-spacing: var(--wui-letter-spacing-sm);
    text-transform: uppercase;
  }

  .wui-font-large-700,
  .wui-font-paragraph-700 {
    font-weight: var(--wui-font-weight-bold);
  }

  .wui-font-large-600,
  .wui-font-paragraph-600,
  .wui-font-small-600,
  .wui-font-tiny-600,
  .wui-font-micro-600 {
    font-weight: var(--wui-font-weight-medium);
  }
`
