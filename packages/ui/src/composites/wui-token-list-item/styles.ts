import { css } from 'lit'

export default css`
  :host {
    height: 60px;
    min-height: 60px;
  }

  :host > wui-flex {
    cursor: pointer;
    height: 100%;
    display: flex;
    column-gap: var(--apkt-spacing-3);
    padding: var(--apkt-spacing-2);
    padding-right: var(--apkt-spacing-4);
    width: 100%;
    background-color: transparent;
    border-radius: var(--apkt-borderRadius-4);
    color: var(--apkt-tokens-theme-foregroundSecondary);
    transition:
      background-color var(--apkt-duration-lg) var(--apkt-ease-out-power-2),
      opacity var(--apkt-duration-lg) var(--apkt-ease-out-power-2);
    will-change: background-color, opacity;
  }

  @media (hover: hover) and (pointer: fine) {
    :host > wui-flex:hover {
      background-color: var(--apkt-tokens-theme-foregroundPrimary);
    }

    :host > wui-flex:active {
      background-color: var(--apkt-tokens-core-glass010);
    }
  }

  :host([disabled]) > wui-flex {
    opacity: 0.6;
  }

  :host([disabled]) > wui-flex:hover {
    background-color: transparent;
  }

  :host > wui-flex > wui-flex {
    flex: 1;
  }

  :host > wui-flex > wui-image,
  :host > wui-flex > .token-item-image-placeholder {
    width: 40px;
    max-width: 40px;
    height: 40px;
    border-radius: var(--apkt-borderRadius-20);
    position: relative;
  }

  :host > wui-flex > .token-item-image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host > wui-flex > wui-image::after,
  :host > wui-flex > .token-item-image-placeholder::after {
    position: absolute;
    content: '';
    inset: 0;
    box-shadow: inset 0 0 0 1px var(--apkt-tokens-core-glass010);
    border-radius: var(--apkt-borderRadius-8);
  }

  button > wui-icon-box[data-variant='square-blue'] {
    border-radius: var(--apkt-borderRadius-2);
    position: relative;
    border: none;
    width: 36px;
    height: 36px;
  }
`
