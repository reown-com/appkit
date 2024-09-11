import { ref } from 'vue'
import { SolStoreUtil } from '../src/utils/SolanaStoreUtil.js'
import { type Connection } from '../src/utils/SolanaTypesUtil.js'

// -- Types -----------------------------------------------------------
export * from '../src/utils/SolanaTypesUtil.js'

// -- Source -----------------------------------------------------------
export * from '../src/index.js'

// -- Hooks -----------------------------------------------------------
export function useWeb3ModalConnection(): {
  connection: Connection | undefined
} {
  const state = ref(SolStoreUtil.state)

  return {
    connection: state.value.connection
  } as {
    connection: Connection | undefined
  }
}
