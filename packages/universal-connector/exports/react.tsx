import { type ReactNode, createContext, useContext, useEffect, useState } from 'react'

import {
  UniversalConnector,
  type Config as UniversalConnectorConfig
} from '../src/UniversalConnector.js'

// -- Types --------------------------------------------------------------------------------
export type UniversalConnectorProviderProps = UniversalConnectorConfig & {
  children: ReactNode
}

// -- State --------------------------------------------------------------------------------
let universalConnector: Awaited<ReturnType<typeof UniversalConnector.init>> | null = null

// -- Context ------------------------------------------------------------------------------
export const UniversalConnectorContext = createContext<{
  connector: Awaited<ReturnType<typeof UniversalConnector.init>> | null
  ready: boolean
} | null>(null)

export function useUniversalConnector() {
  const context = useContext(UniversalConnectorContext)
  if (!context) {
    throw new Error('useUniversalConnector must be used within UniversalConnectorProvider')
  }

  return context
}

// -- Utils & Others -----------------------------------------------------------------------
export async function memoizeCreateUniversalConnector(config: UniversalConnectorConfig) {
  if (!universalConnector) {
    universalConnector = await UniversalConnector.init(config)
  }

  return universalConnector
}

// -- Providers ----------------------------------------------------------------------------
export function UniversalConnectorProvider({
  children,
  ...props
}: UniversalConnectorProviderProps) {
  const [connector, setConnector] = useState<Awaited<
    ReturnType<typeof UniversalConnector.init>
  > | null>(null)

  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    memoizeCreateUniversalConnector(props)
      .then(setConnector)
      .then(() => setIsReady(true))
  }, [props])

  return (
    <UniversalConnectorContext.Provider value={{ connector, ready: isReady }}>
      {children}
    </UniversalConnectorContext.Provider>
  )
}
