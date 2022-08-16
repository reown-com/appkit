interface Animation {
  keys: Keyframe[]
  opts: KeyframeAnimationOptions
}

export const MODAL_FADE_IN: Animation = {
  keys: [{ opacity: 0 }, { opacity: 1 }],
  opts: { fill: 'forwards', duration: 100 }
}

export const MODAL_FADE_OUT: Animation = {
  keys: [{ opacity: 1 }, { opacity: 0 }],
  opts: { fill: 'forwards', duration: 100 }
}
