import { Button, Card, Modal, Text } from '@nextui-org/react'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import type { IEthereumProvider } from '@walletconnect/ethereum-provider/dist/types/EthereumProvider'

import { useEffect, useState } from 'react'
import { getProjectId, getTheme } from '../../utilities/EnvUtil'

export default function WithEthereumProvider() {
  const [providerClient, setProviderClient] = useState<IEthereumProvider | undefined>(undefined)
  const [modalOpen, setModalOpen] = useState(false)

  async function onInitializeProviderClient() {
    setProviderClient(
      await EthereumProvider.init({
        projectId: getProjectId(),
        showQrModal: true,
        qrModalOptions: { themeMode: getTheme() },
        chains: [1],
        methods: ['eth_sendTransaction', 'personal_sign'],
        events: ['connect']
      })
    )
  }

  async function onConnect() {
    if (providerClient) {
      await providerClient.connect()
    } else {
      throw new Error('providerClient is not initialized')
    }
  }

  useEffect(() => {
    if (providerClient) {
      providerClient.on('connect', () => {
        setModalOpen(true)
      })
    }
  }, [providerClient])

  useEffect(() => {
    onInitializeProviderClient()
  }, [])

  return (
    <>
      <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
        <Card.Body css={{ justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Button shadow color="primary" onPress={onConnect}>
            Connect Wallet
          </Button>
        </Card.Body>
      </Card>

      <Modal closeButton blur open={modalOpen} onClose={() => setModalOpen(false)}>
        <Modal.Header>
          <Text h3>Success</Text>
        </Modal.Header>
        <Modal.Body>
          <Text color="grey">Successfully connected</Text>
        </Modal.Body>
      </Modal>
    </>
  )
}
