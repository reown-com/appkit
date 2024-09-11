import { ref } from 'vue'
import { SolStoreUtil } from '@rerock/scaffold-utils/solana'
import type { Connection } from '@rerock/scaffold-utils/solana'

// -- Types -----------------------------------------------------------
export * from '@rerock/scaffold-utils/solana'

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
