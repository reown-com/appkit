import { css } from 'lit'

export default css`
  wui-separator {
    margin: var(--wui-spacing-m) calc(var(--wui-spacing-m) * -1) var(--wui-spacing-xs)
      calc(var(--wui-spacing-m) * -1);
    width: calc(100% + var(--wui-spacing-s) * 2);
  }

  .payment-info {
    padding: var(--wui-spacing-l) 0;
  }

  .amount-container {
    margin-bottom: var(--wui-spacing-s);
  }

  .token-amount {
    margin-bottom: var(--wui-spacing-xs);
  }

  .token-info {
    background-color: var(--wui-color-bg-125);
    border-radius: var(--wui-border-radius-s);
    padding: var(--wui-spacing-xs) var(--wui-spacing-s);
  }

  .payment-options {
    margin-top: var(--wui-spacing-l);
  }

  /* New container for payment actions (wallet + disconnect button) */
  .payment-actions {
    width: 100%;
    gap: var(--wui-spacing-s);
    height: 72px;
  }

  .payment-option {
    background-color: var(--wui-color-bg-125);
    border-radius: var(--wui-border-radius-m);
    padding: var(--wui-spacing-m);
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .payment-option:hover {
    background-color: var(--wui-color-bg-150);
  }

  .wallet-icons {
    width: 40px;
    height: 40px;
    border-radius: var(--wui-border-radius-xs);
    background-color: var(--wui-color-bg-175);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .exchange {
    margin-bottom: var(--wui-spacing-xs);
    height: 72px;
  }

  .exchange-icon-coinbase {
    color: var(--wui-color-accent-100);
  }

  .exchange-icon-binance {
    color: #f0b90b;
  }

  .wallet-payment-button {
    cursor: pointer;
    height: 100%;
    display: flex;
    align-items: center;
  }

  .disconnect-button {
    min-width: 60px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--wui-border-radius-m);
  }

  wui-icon-button button {
    border-radius: 20px;
    background-color: var(--wui-color-accent-glass-015);
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  wui-icon-button wui-icon {
    color: var(--wui-color-accent-100);
  }
`
