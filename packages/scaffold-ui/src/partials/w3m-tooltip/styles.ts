import { css } from 'lit'

export default css`
  :host {
    pointer-events: none;
  }

  :host > wui-flex {
    display: var(--w3m-tooltip-display);
    opacity: var(--w3m-tooltip-opacity);
    padding: 9px var(--apkt-spacing-3) 10px var(--apkt-spacing-3);
    border-radius: var(--apkt-borderRadius-3);
    color: var(--apkt-tokens-theme-backgroundPrimary);
    position: fixed;
    top: var(--w3m-tooltip-top);
    left: var(--w3m-tooltip-left);
    transform: translate(calc(-50% + var(--w3m-tooltip-parent-width)), calc(-100% - 8px));
    max-width: calc(var(--apkt-modal-width) - var(--apkt-spacing-5));
    transition: opacity 0.2s var(--apkt-ease-out-power-2);
    will-change: opacity;
  }

  :host([data-variant='shade']) > wui-flex {
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
    border: 1px solid var(--apkt-tokens-core-glass010);
  }

  :host([data-variant='shade']) > wui-flex > wui-text {
    color: var(--apkt-tokens-theme-textSecondary);
  }

  :host([data-variant='fill']) > wui-flex {
    background-color: var(--apkt-tokens-theme-textPrimary);
    border: none;
  }

  wui-icon {
    position: absolute;
    width: 12px !important;
    height: 4px !important;
    color: var(--apkt-tokens-theme-backgroundPrimary);
  }

  wui-icon[data-placement='top'] {
    bottom: 0px;
    left: 50%;
    transform: translate(-50%, 95%);
  }

  wui-icon[data-placement='bottom'] {
    top: 0;
    left: 50%;
    transform: translate(-50%, -95%) rotate(180deg);
  }

  wui-icon[data-placement='right'] {
    top: 50%;
    left: 0;
    transform: translate(-65%, -50%) rotate(90deg);
  }

  wui-icon[data-placement='left'] {
    top: 50%;
    right: 0%;
    transform: translate(65%, -50%) rotate(270deg);
  }
`
