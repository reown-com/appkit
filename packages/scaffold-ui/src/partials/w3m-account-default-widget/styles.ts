import { css } from 'lit'

export default css`
  :host > wui-flex:first-child {
    transform: translateY(calc(var(--apkt-spacing-2) * -1));
  }

  wui-icon-link {
    margin-right: calc(var(--apkt-spacing-8) * -1);
  }

  wui-notice-card {
    margin-bottom: var(--apkt-spacing-1);
  }

  wui-list-item > wui-text {
    flex: 1;
  }

  w3m-transactions-view {
    max-height: 200px;
  }

  .tab-content-container {
    height: 300px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
  }

  .tab-content-container::-webkit-scrollbar {
    display: none;
  }

  .account-button {
    width: auto;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--apkt-spacing-3);
    height: 48px;
    padding: var(--apkt-spacing-2);
    padding-right: var(--apkt-spacing-3);
    box-shadow: inset 0 0 0 1px var(--apkt-tokens-theme-foregroundPrimary);
    background-color: var(--apkt-tokens-theme-foregroundPrimary);
    border-radius: 24px;
    transition: background-color 0.2s linear;
  }

  .account-button:hover {
    background-color: var(--apkt-tokens-core-glass010);
  }

  .avatar-container {
    position: relative;
  }

  wui-avatar.avatar {
    width: 32px;
    height: 32px;
    box-shadow: 0 0 0 2px var(--apkt-tokens-core-glass010);
  }

  wui-wallet-switch {
    margin-top: var(--apkt-spacing-2);
  }

  wui-avatar.network-avatar {
    width: 16px;
    height: 16px;
    position: absolute;
    left: 100%;
    top: 100%;
    transform: translate(-75%, -75%);
    box-shadow: 0 0 0 2px var(--apkt-tokens-core-glass010);
  }

  .account-links {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .account-links wui-flex {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    background: red;
    align-items: center;
    justify-content: center;
    height: 48px;
    padding: 10px;
    flex: 1 0 0;
    border-radius: var(--XS, 16px);
    border: 1px solid var(--dark-accent-glass-010, rgba(71, 161, 255, 0.1));
    background: var(--dark-accent-glass-010, rgba(71, 161, 255, 0.1));
    transition:
      background-color var(--apkt-ease-out-power-1) var(--apkt-duration-md),
      opacity var(--apkt-ease-out-power-1) var(--apkt-duration-md);
    will-change: background-color, opacity;
  }

  .account-links wui-flex:hover {
    background: var(--dark-accent-glass-015, rgba(71, 161, 255, 0.15));
  }

  .account-links wui-flex wui-icon {
    width: var(--S, 20px);
    height: var(--S, 20px);
  }

  .account-links wui-flex wui-icon svg path {
    stroke: #667dff;
  }
`
