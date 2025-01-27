import { useState } from 'react'

import { type Connector, useConnectors } from 'wagmi'

export function Connectors() {
  const connectors = useConnectors()

  return connectors.map(connector => <Connector key={connector.name} connector={connector} />)
}

function Connector({ connector }: { connector: Connector }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    setIsLoading(true)
    try {
      await connector.connect()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return <button onClick={handleClick}>{isLoading ? 'Loading...' : connector.name}</button>
}
