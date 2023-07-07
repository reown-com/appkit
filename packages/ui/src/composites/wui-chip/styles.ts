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

  a[variant='fill'] {
    color: var(--wui-color-inverse-100);
    background-color: var(--wui-color-blue-100);
  }

  a[variant='shade'] {
    background-color: transparent;
    background-color: var(--wui-overlay-010);
    color: var(--wui-color-fg-200);
  }

  a[variant='transparent'] {
    column-gap: var(--wui-spacing-xxs);
    background-color: transparent;
    padding: 7px 12px 7px 10px;
    color: var(--wui-color-fg-150);
  }

  a[variant='fill'],
  a[variant='shade'] {
    column-gap: var(--wui-spacing-xs);
    padding: 9px 14px 10px 8px;
  }

  a[variant='fill'] > wui-image,
  a[variant='shade'] > wui-image {
    width: 24px;
    height: 24px;
  }

  a[variant='fill'] > wui-icon,
  a[variant='shade'] > wui-icon {
    width: 12px;
    height: 12px;
  }

  a[variant='transparent'] > wui-image {
    width: 14px;
    height: 14px;
  }

  a[variant='transparent'] > wui-icon {
    width: 10px;
    height: 10px;
  }

  a[variant='fill']:focus {
    border: 1px solid var(--wui-overlay-010);
    background-color: var(--wui-color-blue-080);
  }

  @media (hover: hover) and (pointer: fine) {
    a[variant='fill']:hover {
      background-color: var(--wui-color-blue-090);
    }

    a[variant='shade']:hover {
      background-color: var(--wui-overlay-015);
    }

    a[variant='transparent']:hover {
      background-color: var(--wui-overlay-005);
    }
  }
`
