import { Button, Card, Modal, Text } from '@nextui-org/react'
import { Web3Button, Web3NetworkSwitch, useWeb3Modal, useWeb3ModalTheme } from '@web3modal/react'
import { useEffect, useState } from 'react'
import { useAccount, useContractRead, useSignMessage } from 'wagmi'
import { avalanche } from 'wagmi/chains'
import { abi } from '../data/aavePoolV3Abi'

const message = 'Hello Web3Modal!'

export default function WagmiWeb3ModalWidget() {
  const { isConnected } = useAccount()
  const { setTheme } = useWeb3ModalTheme()
  const { open } = useWeb3Modal()
  const { data: signData, isLoading, signMessage } = useSignMessage({ message })
  const { data: contractData, refetch } = useContractRead({
    enabled: false,
    address: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
    abi,
    functionName: 'getReservesList',
    chainId: avalanche.id,
    cacheTime: 0
  })
  const [signModal, setSignModal] = useState(false)
  const [contractModal, setContractModal] = useState(false)

  function getData(data: unknown) {
    if (typeof data === 'object' || Array.isArray(data)) {
      return JSON.stringify(data)
    }

    return String(data)
  }

  useEffect(() => {
    if (signData) {
      setSignModal(true)
    }
  }, [signData])

  useEffect(() => {
    if (contractData) {
      setContractModal(true)
    }
  }, [contractData])

  return (
    <>
      <Card css={{ maxWidth: '400px', margin: '100px auto' }} variant="bordered">
        <Card.Body css={{ justifyContent: 'space-between', alignItems: 'center', height: '280px' }}>
          <Web3Button balance="show" />
          <Web3NetworkSwitch />

          {isConnected ? (
            <>
              <Button color="gradient" onPress={() => signMessage()}>
                Sign Message
              </Button>
              <Button color="gradient" onPress={async () => refetch()}>
                Read Avax Contract
              </Button>
            </>
          ) : (
            <Button color="gradient" onPress={async () => open()}>
              Custom Connect Btn
            </Button>
          )}

          <Button
            color="error"
            onPress={() =>
              setTheme({
                themeVariables: { '--w3m-accent-color': 'coral', '--w3m-background-color': 'coral' }
              })
            }
          >
            Set coral theme
          </Button>
        </Card.Body>
      </Card>

      <Modal closeButton blur open={signModal} onClose={() => setSignModal(false)}>
        <Modal.Header>
          <Text h3>Sign Message</Text>
        </Modal.Header>
        <Modal.Body>
          <Text h4>Message</Text>
          <Text color="grey">{message}</Text>

          <Text h4>Signature</Text>
          <Text color="grey" css={{ wordWrap: 'break-word' }}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {isLoading ? 'Waiting...' : getData(signData)}
          </Text>
        </Modal.Body>
      </Modal>

      <Modal closeButton blur open={contractModal} onClose={() => setContractModal(false)}>
        <Modal.Header>
          <Text h3>Read Contract</Text>
        </Modal.Header>
        <Modal.Body>
          <Text h4>Data</Text>
          <Text color="grey" css={{ wordWrap: 'break-word' }}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {isLoading ? 'Waiting...' : getData(contractData)}
          </Text>
        </Modal.Body>
      </Modal>
    </>
  )
}
