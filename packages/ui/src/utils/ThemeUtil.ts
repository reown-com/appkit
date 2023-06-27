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

    --wui-color-blue-100: #47a1ff;
    --wui-color-inverse-100: #fff;
    --wui-color-inverse-000: #000;
    --wui-color-error-100: #f25a67;
    --wui-color-success-100: #26d962;
    --wui-color-fg-100: #e4e7e7;
    --wui-color-fg-200: #949e9e;
    --wui-color-fg-300: #6e7777;

    --wui-overlay-010: rgba(255, 255, 255, 0.1);
    --wui-overlay-020: rgba(255, 255, 255, 0.2);
  }

  button {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }

  @media (hover: hover) and (pointer: fine) {
    button:active {
      transition: all 0.1s ease;
      transform: scale(0.93);
    }
  }

  button::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    transition: background-color, 0.2s ease;
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
