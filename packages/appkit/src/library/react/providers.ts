import { type ReactNode } from 'react'

import { type CreateAppKit, createAppKit } from '../../../exports/react.js'

// -- Types --------------------------------------------------------------------------------
export type AppKitProviderProps = CreateAppKit & {
  children: ReactNode
}

// -- State --------------------------------------------------------------------------------
let appkit: ReturnType<typeof createAppKit> | null = null

// -- Utils & Others -----------------------------------------------------------------------
export function memoizeCreateAppKit(config: CreateAppKit) {
  if (!appkit) {
    appkit = createAppKit(config)
  }

  return appkit
}

// -- Providers ----------------------------------------------------------------------------
export function AppKitProvider({ children, ...props }: AppKitProviderProps) {
  memoizeCreateAppKit(props)

  return children
}
