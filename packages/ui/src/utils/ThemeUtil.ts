import { css } from 'lit'

export const globalStyles = css`
  *,
  *::after,
  *::before {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-style: normal;
    text-rendering: optimizeSpeed;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: transparent;
    backface-visibility: hidden;
  }

  button {
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border: none;
    background-color: transparent;
    transition: all 0.2s ease;
  }

  @media (hover: hover) and (pointer: fine) {
    button:active {
      transition: all 0.1s ease;
      transform: scale(0.93);
    }
  }

  button::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    transition: background-color, 0.2s ease;
  }

  button:disabled {
    cursor: not-allowed;
  }

  button svg,
  button w3m-text {
    position: relative;
    z-index: 1;
  }

  input {
    border: none;
    outline: none;
    appearance: none;
  }

  img {
    display: block;
  }

  ::selection {
    color: var(--w3m-accent-fill-color);
    background: var(--w3m-accent-color);
  }
`
