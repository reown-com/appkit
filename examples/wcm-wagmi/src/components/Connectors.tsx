import { useConnectors } from 'wagmi'

export function Connectors() {
  const connectors = useConnectors()

  return connectors.map((connector, index) => (
    <div key={index}>
      <button onClick={() => connector.connect()}>{connector.name}</button>
    </div>
  ))
}
