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
    width: 100%;
    height: 100%;
  }

  .w3m-modal-content {
    background-color: white;
  }
`
