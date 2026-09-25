import { ref } from 'vue'

import type { Connection, Rpc } from '@reown/appkit-utils/solana'

import { SolStoreUtil } from '../src/utils/SolanaStoreUtil.js'

// -- Types -----------------------------------------------------------
export * from '@reown/appkit-utils/solana'

// -- Source -----------------------------------------------------------
export * from '../src/index.js'

// -- Hooks -----------------------------------------------------------
export function useAppKitConnection(): {
  connection: Connection | undefined
  rpc: Rpc | undefined
} {
  const state = ref(SolStoreUtil.state)

  return {
    connection: state.value.connection,
    rpc: state.value.rpc
  } as {
    connection: Connection | undefined
    rpc: Rpc | undefined
  }
}
