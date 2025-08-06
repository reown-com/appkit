import { css } from '../../utils/ThemeHelperUtil.js'

export default css`
  .container {
    display: block;
    overflow: hidden;
    overflow: hidden;
    position: relative;
    height: var(--new-height);
    transition: height var(--local-duration, var(--apkt-duration-lg)) var(--apkt-ease-out-power-1);
    width: var(--apkt-modal-width);
  }

  .page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    width: var(--apkt-modal-width);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  }

  div.page[view-direction^='prev-'] {
    animation:
      slide-left-out var(--local-duration, var(--apkt-duration-lg)) forwards
        var(--local-transition, var(--apkt-ease-out-power-2)),
      slide-left-in var(--local-duration, var(--apkt-duration-lg)) forwards
        var(--local-transition, var(--apkt-ease-out-power-2));
    animation-delay: 0ms, var(--local-duration, var(--apkt-duration-lg));
  }

  div.page[view-direction^='next-'] {
    animation:
      slide-right-out var(--local-duration, var(--apkt-duration-lg)) forwards
        var(--local-transition, var(--apkt-ease-out-power-2)),
      slide-right-in var(--local-duration, var(--apkt-duration-lg)) forwards
        var(--local-transition, var(--apkt-ease-out-power-2));
    animation-delay: 0ms, var(--local-duration, var(--apkt-duration-lg));
  }

  @keyframes slide-left-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-left-in {
    from {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }

  @keyframes slide-right-out {
    from {
      transform: translateX(0px) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
    to {
      transform: translateX(-8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
  }

  @keyframes slide-right-in {
    from {
      transform: translateX(8px) scale(0.99);
      opacity: 0;
      filter: blur(4px);
    }
    to {
      transform: translateX(0) translateY(0) scale(1);
      opacity: 1;
      filter: blur(0px);
    }
  }
`
