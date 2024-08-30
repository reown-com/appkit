import { useSnapshot } from 'valtio'
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
  const state = useSnapshot(SolStoreUtil.state)

  return {
    connection: state.connection
  } as {
    connection: Connection | undefined
  }
}
