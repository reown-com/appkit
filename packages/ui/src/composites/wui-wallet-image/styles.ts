import { css } from 'lit'

export default css`
  :host {
    position: relative;
    border-radius: inherit;
    overflow: hidden;
    background: var(--wui-overlay-002);
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--local-size);
    height: var(--local-size);
    border-radius: var(--local-border-radius);
  }

  :host::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    border-radius: inherit;
    border: 1px solid var(--wui-overlay-010);
    pointer-events: none;
  }

  wui-icon[parentSize='inherit'] {
    width: 75%;
    height: 75%;
    align-items: center;
  }

  wui-icon[parentSize='sm'] {
    width: 18px;
    height: 18px;
  }

  wui-icon[parentSize='md'] {
    width: 24px;
    height: 24px;
  }

  wui-icon[parentSize='lg'] {
    width: 42px;
    height: 42px;
  }
`
