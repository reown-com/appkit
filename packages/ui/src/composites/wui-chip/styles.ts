import { css } from 'lit'

export default css`
  a {
    border: 1px solid var(--wui-overlay-010);
    border-radius: var(--wui-border-radius-3xl);
  }

  wui-image {
    border-radius: var(--wui-border-radius-3xl);
    overflow: hidden;
  }

  a[data-variant='fill'] {
    color: var(--wui-color-inverse-100);
    background-color: var(--wui-color-blue-100);
  }

  a[data-variant='shade'] {
    background-color: transparent;
    background-color: var(--wui-overlay-010);
    color: var(--wui-color-fg-200);
  }

  a[data-variant='transparent'] {
    column-gap: var(--wui-spacing-xxs);
    background-color: transparent;
    padding: 7px 12px 7px 10px;
    color: var(--wui-color-fg-150);
  }

  a[data-variant='transparent']:has(wui-text:first-child) {
    padding: 7px 12px;
  }

  a[data-variant='fill'],
  a[data-variant='shade'] {
    column-gap: var(--wui-spacing-xs);
    padding: 8.5px 14px 9.5px 8px;
  }

  a[data-variant='fill']:has(wui-text:first-child),
  a[data-variant='shade']:has(wui-text:first-child) {
    padding: 8.5px 14px 9.5px 14px;
  }

  a[data-variant='fill'] > wui-image,
  a[data-variant='shade'] > wui-image {
    width: 24px;
    height: 24px;
  }

  a[data-variant='fill'] > wui-image {
    border: 1px solid var(--wui-color-blue-090);
  }

  a[data-variant='shade'] > wui-image {
    border: 1px solid var(--wui-overlay-010);
  }

  a[data-variant='fill'] > wui-icon,
  a[data-variant='shade'] > wui-icon {
    width: 12px;
    height: 12px;
  }

  a[data-variant='transparent'] > wui-image {
    width: 14px;
    height: 14px;
  }

  a[data-variant='transparent'] > wui-icon {
    width: 10px;
    height: 10px;
  }

  a[data-variant='fill']:focus {
    border: 1px solid var(--wui-overlay-010);
    background-color: var(--wui-color-blue-080);
  }

  @media (hover: hover) and (pointer: fine) {
    a[data-variant='fill']:hover {
      background-color: var(--wui-color-blue-090);
    }

    a[data-variant='shade']:hover {
      background-color: var(--wui-overlay-015);
    }

    a[data-variant='transparent']:hover {
      background-color: var(--wui-overlay-005);
    }
  }
`
