import { css } from 'lit'

export default css`
  button {
    padding: 6.5px var(--apkt-spacing-4) 6.5px var(--apkt-spacing-2);
    display: flex;
    justify-content: space-between;
    width: 100%;
    border-radius: var(--apkt-borderRadius-4);
    background-color: var(--apkt-tokens-theme-foregroundPrimary);
  }

  button[data-clickable='false'] {
    pointer-events: none;
    background-color: transparent;
  }

  wui-image {
    width: var(--apkt-spacing-10);
    height: var(--apkt-spacing-10);
    border-radius: var(--apkt-borderRadius-20);
  }

  wui-avatar {
    width: var(--apkt-spacing-10);
    height: var(--apkt-spacing-10);
    box-shadow: 0 0 0 0;
  }
  .address {
    color: var(--apkt-tokens-theme-foregroundPrimary);
  }
  .address-description {
    text-transform: capitalize;
    color: var(--apkt-tokens-theme-foregroundSecondary);
  }

  wui-icon-box {
    position: relative;
    right: 15px;
    top: 15px;
    border: 2px solid var(--apkt-tokens-theme-backgroundPrimary);
    background-color: var(--apkt-tokens-theme-backgroundPrimary);
  }
`
