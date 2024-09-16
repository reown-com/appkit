import { ref } from 'vue'
import type { Connection } from '@reown/appkit-utils/solana'
import { SolStoreUtil } from '../src/utils/SolanaStoreUtil.js'

// -- Types -----------------------------------------------------------
export * from '@reown/appkit-utils/solana'

// -- Source -----------------------------------------------------------
export * from '../src/index.js'

// -- Hooks -----------------------------------------------------------
export function useAppKitConnection(): {
  connection: Connection | undefined
} {
  const state = ref(SolStoreUtil.state)

  return {
    connection: state.value.connection
  } as {
    connection: Connection | undefined
  }
}
