import { Button, Card, Modal, Text } from '@nextui-org/react'
import {
  Web3Button,
  Web3NetworkSwitch,
  useWeb3Modal,
  useWeb3ModalEvents,
  useWeb3ModalTheme
} from '@web3modal/react'
import { useEffect, useState } from 'react'
import { useAccount, useContractRead, useSignMessage } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { abi } from '../data/SeaportAbi'

const message = 'Hello Web3Modal!'

export default function WagmiWeb3ModalWidget() {
  // -- Web3Modal Hooks -------------------------------------------------------
  useWeb3ModalEvents(event => console.info(event))
  const { setTheme } = useWeb3ModalTheme()
  const { open } = useWeb3Modal()

  // -- Wagmi Hooks -----------------------------------------------------------
  const { isConnected } = useAccount()
  const { data: signData, isLoading, signMessage } = useSignMessage({ message })
  const { data: contractData, refetch } = useContractRead({
    enabled: false,
    address: '0x00000000000001ad428e4906aE43D8F9852d0dD6',
    abi,
    functionName: 'name',
    chainId: mainnet.id,
    cacheTime: 0
  })

  // -- React Hooks -----------------------------------------------------------
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
                Read Eth Contract
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
