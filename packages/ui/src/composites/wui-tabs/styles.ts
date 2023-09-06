import { css } from 'lit'

export default css`
  :host {
    display: inline-flex;
    background-color: var(--wui-overlay-002);
    border-radius: var(--wui-border-radius-3xl);
    padding: var(--wui-spacing-3xs);
    position: relative;
    height: 36px;
    overflow: hidden;
  }

  :host::before {
    content: '';
    position: absolute;
    pointer-events: none;
    top: 4px;
    left: 4px;
    display: block;
    width: var(--local-tab-width);
    height: 28px;
    border-radius: var(--wui-border-radius-3xl);
    background-color: var(--wui-overlay-002);
    box-shadow: inset 0 0 0 1px var(--wui-overlay-002);
    transform: translateX(calc(var(--local-tab) * var(--local-tab-width)));
    transition: transform var(--wui-ease-out-power-2) var(--wui-duration-lg);
  }

  :host([data-type='flex'])::before {
    transform: translateX(calc(var(--local-tab) * var(--local-tab-width) / 2.02));
  }

  :host([data-type='flex']) {
    display: flex;
    padding: 0px 4px;
  }

  :host([data-type='flex']) > button[data-active='true'] > wui-text {
    animation-name: fadein;
    animation-duration: 0.5s;
  }

  button[data-active='true'] > wui-icon,
  button[data-active='true'] > wui-text {
    color: var(--wui-color-fg-100);
  }

  button[data-active='false'] > wui-icon,
  button[data-active='false'] > wui-text {
    color: var(--wui-color-fg-200);
  }

  button > wui-icon,
  button > wui-text {
    pointer-events: none;
    transition: all var(--wui-ease-out-power-2) var(--wui-duration-lg);
  }

  button {
    width: var(--local-tab-width);
  }

  :host([data-type='flex']) > button {
    width: var(--local-dense-tab-width);
    padding: 0px 16px;
  }

  :host([data-type='flex']) > button[data-active='true'] {
    min-width: 105px;
  }

  button:hover:enabled,
  button:active:enabled {
    background-color: transparent !important;
  }

  button:hover > wui-icon,
  button:active > wui-icon {
    color: var(--wui-color-fg-125);
  }

  button:hover > wui-text,
  button:active > wui-text {
    color: var(--wui-color-fg-125);
  }

  @keyframes fadein {
    from {
      opacity: 0;
      transform: translateX(10px);
    }
    to {
      opacity: 1;
      transform: translateX(0px);
    }
  }

  @keyframes fadeout {
    from {
      opacity: 1;
      transform: translateX(0px);
    }
    to {
      opacity: 0;
      transform: translateX(-10px);
    }
  }
`
