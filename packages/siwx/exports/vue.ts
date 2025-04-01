import { type Ref, onMounted, onUnmounted, ref } from 'vue'

import { OptionsController, type SIWXConfig } from '@reown/appkit-controllers'

export function useAppKitSIWX<Config extends SIWXConfig = SIWXConfig>() {
  const state = ref(OptionsController.state.siwx)

  const unsubscribe = OptionsController.subscribeKey('siwx', val => {
    state.value = val
  })

  onMounted(() => {
    state.value = OptionsController.state.siwx
  })

  onUnmounted(() => {
    unsubscribe()
  })

  return state as Ref<Config | undefined>
}
