import type { Ref } from 'vue'
import { onMounted, ref } from 'vue'
import type { Web3ModalOptions } from './client.js'
import { Web3Modal as Web3ModalCore } from './client.js'

const modal: Ref<Web3ModalCore | null> = ref(null)

export const Web3Modal = {
  name: 'Web3Modal',
  props: {
    options: {
      type: Object as () => Web3ModalOptions,
      required: true
    }
  },
  setup(props: { options: Web3ModalOptions }) {
    onMounted(() => {
      modal.value = new Web3ModalCore(props.options)
    })
  },
  render() {
    return null
  }
}

export function useWeb3Modal() {
  if (!modal.value) {
    throw new Error('useWeb3Modal function used before <Web3Modal /> component was mounted')
  }

  return modal.value
}
