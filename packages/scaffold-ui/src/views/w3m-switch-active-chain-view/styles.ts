import { css } from 'lit'

export default css`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-visual {
    width: var(--apkt-spacing-4);
    height: var(--apkt-spacing-4);
    border-radius: calc(var(--apkt-borderRadius-1) * 9 - var(--apkt-borderRadius-3));
    position: relative;
    overflow: hidden;
  }

  wui-visual::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: calc(var(--apkt-borderRadius-1) * 9 - var(--apkt-borderRadius-3));
    box-shadow: inset 0 0 0 1px var(--apkt-tokens-core-glass010);
  }

  wui-icon-box {
    position: absolute;
    right: calc(var(--apkt-spacing-1) * -1);
    bottom: calc(var(--apkt-spacing-1) * -1);
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity var(--apkt-ease-out-power-2) var(--apkt-duration-lg),
      transform var(--apkt-ease-out-power-2) var(--apkt-duration-lg);
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px var(--apkt-spacing-4);
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  wui-link {
    padding: var(--apkt-spacing-01) var(--apkt-spacing-2);
  }

  .capitalize {
    text-transform: capitalize;
  }
`
