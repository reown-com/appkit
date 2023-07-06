import { css } from 'lit'

export default css`
  :host {
    position: relative;
    width: 100%;
    display: inline-block;
    color: var(--wui-color-fg-275);
  }

  input {
    width: 100%;
    border-radius: var(--wui-border-radius-xxs);
    border: 1px solid var(--wui-overlay-005);
    background: var(--wui-overlay-005);
    font-size: var(--wui-font-size-paragraph);
    font-weight: var(--wui-font-weight-regular);
    letter-spacing: var(--wui-letter-spacing-paragraph);
    color: var(--wui-color-fg-100);
    transition: all 200ms ease-in-out 35ms;
    caret-color: var(--wui-color-blue-100);
  }

  input:disabled {
    cursor: not-allowed;
    border: 1px solid var(--wui-overlay-010);
    background: var(--wui-overlay-015);
  }

  input:disabled::placeholder,
  input:disabled + wui-icon {
    color: var(--wui-color-fg-300);
  }

  input::placeholder {
    color: var(--wui-color-fg-275);
  }

  input:focus:enabled {
    transition: all 100ms ease-out;
    background-color: var(--wui-overlay-010);
    border: 1px solid var(--wui-color-blue-100);
    -webkit-box-shadow: 0px 0px 0px 4px var(--wui-box-shadow-blue);
    -moz-box-shadow: 0px 0px 0px 4px var(--wui-box-shadow-blue);
    box-shadow: 0px 0px 0px 4px var(--wui-box-shadow-blue);
  }

  @media (hover: hover) and (pointer: fine) {
    input:hover:enabled {
      background-color: var(--wui-overlay-010);
    }
  }

  wui-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }

  .wui-size-sm {
    padding: 9px 14px 10px 12px;
  }

  wui-icon + .wui-size-sm {
    padding: 9px 14px 10px 38px;
  }

  wui-icon[size='md'] {
    left: 12px;
  }

  .wui-size-md {
    padding: 15px 14px 16px 14px;
  }

  wui-icon + .wui-size-md {
    padding: 15px 14px 16px 42px;
  }

  wui-icon[size='lg'] {
    left: 14px;
  }

  input:placeholder-shown ~ ::slotted(wui-input-element) {
    opacity: 0;
  }

  ::slotted(wui-input-element) {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 14px;
    transition: all 200ms ease-in;
  }
`
