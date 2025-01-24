import { type Connector, useConnectors } from 'wagmi'

export function Connectors() {
  const connectors = useConnectors()

  return connectors.map(connector => (
    <button key={connector.id} onClick={createConnectorClickHandler(connector)}>
      {connector.name}
    </button>
  ))
}

function createConnectorClickHandler(connector: Connector) {
  if (connector['connected']) {
    return () => connector.disconnect().then(() => (connector['connected'] = false))
  } else {
    return () => connector.connect().then(() => (connector['connected'] = true))
  }
}
