import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'

import { type Connector, useAccount, useConnect, useConnectors } from 'wagmi'

export function Connectors() {
  const [uri, setUri] = useState('')

  const connectors = useConnectors()
  const account = useAccount()

  if (account.isConnected) {
    return null
  }

  const handleCopyUri = () => {
    window.navigator.clipboard.writeText(uri)
  }

  const handleCancel = () => {
    setUri('')
  }

  return (
    <div className="list__connectors">
      <div className="wrapper__wc_qr_code" style={{ display: uri ? undefined : 'none' }}>
        <div className="container__wc_qr_code">
          <QRCode value={uri} />
          <div className="container__wc_qr_code_buttons">
            <button onClick={handleCopyUri}>Copy URI</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>

      {connectors.map(connector => {
        if (connector.id === 'custom-wallet-connect') {
          return (
            <CustomWalletConnectConnector key={connector.id} connector={connector} onUri={setUri} />
          )
        }

        return <Connector key={connector.id} connector={connector} />
      })}
    </div>
  )
}

/**
 * This is an example of implementing Wagmi Connector component with default connector implementation
 */
function Connector({ connector }: { connector: Connector }) {
  const { connectAsync } = useConnect()

  return <button onClick={() => connectAsync({ connector })}>{connector.name}</button>
}

/**
 *
 * This is an example of implementing WalletConnectConnector component with custom connector and QR code handling
 */
function CustomWalletConnectConnector({
  connector,
  onUri
}: {
  connector: Connector
  onUri: (uri: string) => void
}) {
  const { connectAsync } = useConnect()

  useEffect(() => {
    function handleDisplayUri(message: { type: string; data?: unknown }) {
      if (message.type === 'display_uri') {
        onUri(message.data as string)
      }
    }

    connector.emitter.on('message', handleDisplayUri)

    return () => {
      connector.emitter.off('message', handleDisplayUri)
    }
  }, [])

  return <button onClick={() => connectAsync({ connector })}>{connector.name}</button>
}
