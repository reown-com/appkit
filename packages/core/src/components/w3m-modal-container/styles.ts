import { css } from 'lit'

export default css`
  .w3m-modal-overlay {
    inset: 0;
    position: fixed;
    z-index: 10001;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.5);
  }

  .w3m-modal-container {
    position: relative;
    width: 400px;
    max-height: 80vh;
  }

  .w3m-modal-media {
    position: absolute;
    display: block;
    pointer-events: none;
    width: 100%;
    height: 100%;
    --gradient-color-1: #cad8f2;
    --gradient-color-2: #be3620;
    --gradient-color-3: #a6208c;
    --gradient-color-4: #06968f;
  }

  .w3m-modal-content {
    background-color: white;
    width: 400px;
    height: 300px;
  }

  #w3m-transparent-noise {
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    position: absolute;
    mix-blend-mode: multiply;
    opacity: 0.45;
  }
`
