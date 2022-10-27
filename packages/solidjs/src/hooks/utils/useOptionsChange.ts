import { createEffect, createSignal } from 'solid-js'

export function useOptionsChange<TOptions>(callback: () => void, options?: TOptions) {
  const newOptions = typeof options === 'object' ? JSON.stringify(options) : undefined
  const [prevOptions, setPrevOptions] = createSignal(newOptions)

  createEffect(() => {
    if (newOptions && prevOptions() && newOptions !== prevOptions()) callback()
    setPrevOptions(newOptions)
  })
}
