import { css } from 'lit'

export default css`
  :host {
    position: relative;
    user-select: none;
    display: block;
    overflow: hidden;
    aspect-ratio: 1 / 1;
    animation: fadeIn ease 0.2s;
    width: var(--local-size);
  }

  @keyframes fadeIn {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  :host([data-theme='dark']) {
    background-color: var(--wui-color-inverse-100);
    border-radius: var(--wui-border-radius-m);
    box-shadow: 0 2px 5px var(--wui-color-inverse-000);
    padding: 16px;
  }

  svg:first-child,
  wui-image,
  wui-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
  }

  wui-image {
    width: 25%;
    height: 25%;
    border-radius: var(--wui-border-radius-xs);
  }

  wui-icon {
    width: 100%;
    height: 100%;
    color: var(--wui-color-blue-100) !important;
    transform: translateY(-50%) translateX(-50%) scale(0.2);
  }
`
