import { css } from 'lit'

// -- Utilities ---------------------------------------------------------------
export function initializeTheming() {
  const styleTag = document.createElement('style')
  styleTag.dataset.wui = 'theme'
  styleTag.textContent = rootStyles.cssText
  document.head.appendChild(styleTag)
}

export function setColorTheme(theme: string) {
  document.documentElement.setAttribute('data-wui-theme', theme)
}

// -- Presets -----------------------------------------------------------------
export const rootStyles = css`
  :root {
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

    --wui-border-radius-4xs: 6px;
    --wui-border-radius-3xs: 8px;
    --wui-border-radius-xxs: 12px;
    --wui-border-radius-xs: 16px;
    --wui-border-radius-s: 20px;
    --wui-border-radius-m: 28px;
    --wui-border-radius-l: 36px;
    --wui-border-radius-3xl: 80px;

    --wui-spacing-4xs: 2px;
    --wui-spacing-3xs: 4px;
    --wui-spacing-xxs: 6px;
    --wui-spacing-xs: 8px;
    --wui-spacing-s: 12px;
    --wui-spacing-m: 14px;
    --wui-spacing-l: 16px;
    --wui-spacing-xl: 20px;
    --wui-spacing-xxl: 24px;
    --wui-spacing-3xl: 40px;
  }

  [data-wui-theme='dark'] {
    --wui-color-blue-100: #47a1ff;
    --wui-color-blue-090: #59aaff;
    --wui-color-blue-080: #6cb4ff;

    --wui-color-fg-100: #e4e7e7;
    --wui-color-fg-125: #d0d5d5;
    --wui-color-fg-150: #a8b1b1;
    --wui-color-fg-175: #a8b0b0;
    --wui-color-fg-200: #949e9e;
    --wui-color-fg-225: #868f8f;
    --wui-color-fg-250: #788080;
    --wui-color-fg-275: #788181;
    --wui-color-fg-300: #6e7777;

    --wui-color-bg-100: #141414;
    --wui-color-bg-125: #191a1a;
    --wui-color-bg-150: #1e1f1f;
    --wui-color-bg-175: #222525;
    --wui-color-bg-200: #272a2a;
    --wui-color-bg-225: #2c3030;
    --wui-color-bg-250: #313535;
    --wui-color-bg-275: #363b3b;
    --wui-color-bg-300: #3b4040;

    --wui-color-inverse-100: #fff;
    --wui-color-inverse-000: #000;

    --wui-color-success-100: #26d962;
    --wui-color-error-100: #f25a67;

    --wui-color-teal-100: #36e2e2;
    --wui-color-magenta-100: #cb4d8c;
    --wui-color-indigo-100: #516dfb;
    --wui-color-orange-100: #ffa64c;
    --wui-color-purple-100: #906ef7;

    --wui-overlay-002: rgba(255, 255, 255, 0.02);
    --wui-overlay-005: rgba(255, 255, 255, 0.05);
    --wui-overlay-010: rgba(255, 255, 255, 0.1);
    --wui-overlay-015: rgba(255, 255, 255, 0.15);
    --wui-overlay-020: rgba(255, 255, 255, 0.2);
    --wui-overlay-025: rgba(255, 255, 255, 0.25);
    --wui-overlay-030: rgba(255, 255, 255, 0.3);

    --wui-box-shadow-blue: rgba(71, 161, 255, 0.16);
  }

  [data-wui-theme='light'] {
    --wui-color-blue-100: #3396ff;
    --wui-color-blue-090: #2d7dd2;
    --wui-color-blue-080: #2978cc;

    --wui-color-fg-100: #141414;
    --wui-color-fg-125: #2d3131;
    --wui-color-fg-150: #474d4d;
    --wui-color-fg-175: #636d6d;
    --wui-color-fg-200: #798686;
    --wui-color-fg-225: #828f8f;
    --wui-color-fg-250: #8b9797;
    --wui-color-fg-275: #95a0a0;
    --wui-color-fg-300: #9ea9a9;

    --wui-color-bg-100: #ffffff;
    --wui-color-bg-125: #f5fafa;
    --wui-color-bg-150: #f3f8f8;
    --wui-color-bg-175: #eef4f4;
    --wui-color-bg-200: #eaf1f1;
    --wui-color-bg-225: #e5eded;
    --wui-color-bg-250: #e1e9e9;
    --wui-color-bg-275: #dce7e7;
    --wui-color-bg-300: #d8e3e3;

    --wui-color-inverse-100: #fff;
    --wui-color-inverse-000: #000;

    --wui-color-success-100: #26b562;
    --wui-color-error-100: #f05142;

    --wui-color-teal-100: #2bb6b6;
    --wui-color-magenta-100: #c65380;
    --wui-color-indigo-100: #3d5cf5;
    --wui-color-orange-100: #ea8c2e;
    --wui-color-purple-100: #794cff;

    --wui-overlay-002: rgba(0, 0, 0, 0.02);
    --wui-overlay-005: rgba(0, 0, 0, 0.05);
    --wui-overlay-010: rgba(0, 0, 0, 0.1);
    --wui-overlay-015: rgba(0, 0, 0, 0.15);
    --wui-overlay-020: rgba(0, 0, 0, 0.2);
    --wui-overlay-025: rgba(0, 0, 0, 0.25);
    --wui-overlay-030: rgba(0, 0, 0, 0.3);

    --wui-box-shadow-blue: rgba(51, 150, 255, 0.16);
  }
`

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

  input {
    border: none;
    outline: none;
    appearance: none;
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
