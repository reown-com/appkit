import { css } from 'lit'

export const globalStyles = css`
  *,
  *::after,
  *::before,
  :host {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-style: normal;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    backface-visibility: hidden;

    --wui-font-family: 'SF Pro Text', 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', sans-serif;
    --wui-font-size-xxs: 10px;
    --wui-font-size-sm: 14px;
    --wui-font-size-md: 16px;
    --wui-font-size-lg: 20px;

    --wui-font-weight-medium: 500;
    --wui-font-weight-semibold: 600;
    --wui-font-weight-bold: 700;

    --wui-letter-spacing-sm: -0.02em;
    --wui-letter-spacing-md: -0.03em;
    --wui-letter-spacing-lg: -0.05em;

    --wui-line-height-sm: 120%;
    --wui-line-height-md: 125%;
    --wui-line-height-lg: 130%;

    --wui-color-inherit: inherit;
    --wui-color-blue-100: #47a1ff;
    --wui-color-blue-090: #59aaff;
    --wui-color-blue-080: #6cb4ff;
    --wui-color-inverse-100: #fff;
    --wui-color-inverse-000: #000;
    --wui-color-error-100: #f25a67;
    --wui-color-success-100: #26d962;
    --wui-color-fg-100: #e4e7e7;
    --wui-color-fg-200: #949e9e;
    --wui-color-fg-300: #6e7777;
    --wui-color-bg-300: #3b4040;

    --wui-overlay-002: rgba(255, 255, 255, 0.02);
    --wui-overlay-005: rgba(255, 255, 255, 0.05);
    --wui-overlay-010: rgba(255, 255, 255, 0.1);
    --wui-overlay-015: rgba(255, 255, 255, 0.15);
    --wui-overlay-020: rgba(255, 255, 255, 0.2);
    --wui-overlay-025: rgba(255, 255, 255, 0.25);
    --wui-overlay-030: rgba(255, 255, 255, 0.3);
  }

  button {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  button:disabled {
    cursor: not-allowed;
  }

  button svg,
  button w3m-text {
    position: relative;
    z-index: 1;
  }

  input {
    border: none;
    outline: none;
    appearance: none;
  }

  img {
    display: block;
  }

  ::selection {
    color: var(--w3m-accent-fill-color);
    background: var(--w3m-accent-color);
  }
`

export const colorStyles = css`
  .wui-color-inherit {
    color: var(--wui-color-inherit);
  }

  .wui-color-blue-100 {
    color: var(--wui-color-blue-100);
  }

  .wui-color-error-100 {
    color: var(--wui-color-error-100);
  }

  .wui-color-success-100 {
    color: var(--wui-color-success-100);
  }

  .wui-color-inverse-100 {
    color: var(--wui-color-inverse-100);
  }

  .wui-color-inverse-000 {
    color: var(--wui-color-inverse-000);
  }

  .wui-color-fg-100 {
    color: var(--wui-color-fg-100);
  }

  .wui-color-fg-200 {
    color: var(--wui-color-fg-200);
  }

  .wui-color-fg-300 {
    color: var(--wui-color-fg-300);
  }

  .wui-bg-color-inherit {
    background-color: var(--wui-color-inherit);
  }

  .wui-bg-color-blue-100 {
    background-color: var(--wui-color-blue-100);
  }

  .wui-bg-color-error-100 {
    background-color: var(--wui-color-error-100);
  }

  .wui-bg-color-success-100 {
    background-color: var(--wui-color-success-100);
  }

  .wui-bg-color-inverse-100 {
    background-color: var(--wui-color-inverse-100);
  }

  .wui-bg-color-inverse-000 {
    background-color: var(--wui-color-inverse-000);
  }

  .wui-bg-color-fg-100 {
    background-color: var(--wui-color-fg-100);
  }

  .wui-bg-color-fg-200 {
    background-color: var(--wui-color-fg-200);
  }

  .wui-bg-color-fg-300 {
    background-color: var(--wui-color-fg-300);
  }
`
