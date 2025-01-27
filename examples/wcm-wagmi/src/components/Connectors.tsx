import { useEffect, useState } from 'react'
import QRCode from 'react-qr-code'

import { type Connector, useAccount, useConnectors } from 'wagmi'

export function Connectors() {
  const connectors = useConnectors()
  const account = useAccount()

  if (account.isConnected) {
    return null
  }

  if (account.isConnecting) {
    return <div>Connecting...</div>
  }

  return (
    <div className="list__connectors">
      {connectors.map(connector =>
        connector.id === 'custom-wallet-connect' ? (
          <CustomWalletConnectConnector key={connector.id} connector={connector} />
        ) : (
          <Connector key={connector.name} connector={connector} />
        )
      )}
    </div>
  )
}

/**
 * This is an example of implementing Wagmi Connector component with default connector implementation
 */
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

  return (
    <button onClick={handleClick} disabled={isLoading}>
      {isLoading ? 'Loading...' : connector.name}
    </button>
  )
}

/**
 *
 * This is an example of implementing WalletConnectConnector component with custom connector and QR code handling
 */
function CustomWalletConnectConnector({ connector }: { connector: Connector }) {
  const [uri, setUri] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const handleDisplayUri = (event: { type: string; data?: unknown }) => {
      if (event.type !== 'display_uri') return
      setUri(event.data as string)
    }

    const handleConnect = async () => {
      setUri('')
    }

    connector.emitter.on('message', handleDisplayUri)
    connector.emitter.on('connect', handleConnect)

    return () => {
      connector.emitter.off('message', handleDisplayUri)
      connector.emitter.off('connect', handleConnect)
    }
  }, [])

  const handleConnect = async () => {
    setIsLoading(true)
    try {
      await connector.connect()
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyUri = () => {
    window.navigator.clipboard.writeText(uri)
  }

  const handleCancel = () => {
    setUri('')
    setIsLoading(false)
  }

  return (
    <>
      <div className="wrapper__wc_qr_code" style={{ display: uri ? undefined : 'none' }}>
        <div className="container__wc_qr_code">
          <QRCode value={uri} />
          <button onClick={handleCopyUri}>Copy URI</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>

      <button onClick={handleConnect} disabled={isLoading}>
        {isLoading ? 'Loading...' : connector.name}
      </button>
    </>
  )
}
