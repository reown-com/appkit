import { css } from 'lit'

export default css`
  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--wui-spacing-3xs);

    transition-property: margin, height;
    transition-duration: var(--wui-duration-md);
    transition-timing-function: var(--wui-ease-out-power-1);
    margin-top: -100px;

    &[data-state='loading'] {
      margin-top: 0px;
    }

    position: relative;
    &:after {
      content: '';
      position: absolute;
      bottom: 0;
      height: 252px;
      width: 360px;
      background: radial-gradient(
        96.11% 53.95% at 50% 51.28%,
        transparent 0%,
        color-mix(in srgb, var(--wui-color-bg-100) 5%, transparent) 49%,
        color-mix(in srgb, var(--wui-color-bg-100) 65%, transparent) 99.43%
      );
    }
  }

  .hero-main-icon {
    width: 176px;
    transition-property: background-color;
    transition-duration: var(--wui-duration-lg);
    transition-timing-function: var(--wui-ease-out-power-1);

    &[data-state='loading'] {
      width: 56px;
    }
  }

  .hero-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: var(--wui-spacing-3xs);
    flex-wrap: nowrap;
    min-width: fit-content;

    &:nth-child(1) {
      transform: translateX(-30px);
    }

    &:nth-child(2) {
      transform: translateX(30px);
    }

    &:nth-child(4) {
      transform: translateX(40px);
    }

    transition-property: height;
    transition-duration: var(--wui-duration-md);
    transition-timing-function: var(--wui-ease-out-power-1);
    height: 68px;

    &[data-state='loading'] {
      height: 0px;
    }
  }

  .hero-row-icon {
    opacity: 0.1;
    transition-property: opacity;
    transition-duration: var(--wui-duration-md);
    transition-timing-function: var(--wui-ease-out-power-1);

    &[data-state='loading'] {
      opacity: 0;
    }
  }

  .email-sufixes {
    display: flex;
    flex-direction: row;
    gap: var(--wui-spacing-3xs);
    overflow-x: auto;
    max-width: 100%;
    margin-top: var(--wui-spacing-s);
    margin-bottom: calc(-1 * var(--wui-spacing-m));
    padding-bottom: var(--wui-spacing-m);
    margin-left: calc(-1 * var(--wui-spacing-m));
    margin-right: calc(-1 * var(--wui-spacing-m));
    padding-left: var(--wui-spacing-m);
    padding-right: var(--wui-spacing-m);

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .recent-emails {
    display: flex;
    flex-direction: column;
    padding: var(--wui-spacing-s) 0;
    border-top: 1px solid var(--wui-color-gray-glass-005);
    border-bottom: 1px solid var(--wui-color-gray-glass-005);
  }

  .recent-emails-heading {
    margin-bottom: var(--wui-spacing-s);
  }

  .recent-emails-list-item {
    --wui-color-gray-glass-002: transparent;
  }
`
