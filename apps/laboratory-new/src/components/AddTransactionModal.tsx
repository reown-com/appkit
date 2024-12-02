import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay
} from '@chakra-ui/react'
import { useState } from 'react'
import { ethers } from 'ethers'
import { useChakraToast } from './Toast'

type IAddTransactionModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (params: { eth: string; to: string }) => void
}
export function AddTransactionModal({ isOpen, onClose, onSubmit }: IAddTransactionModalProps) {
  const toast = useChakraToast()
  const [eth, setEth] = useState(0)
  const [to, setTo] = useState('')
  function onAddTransaction() {
    if (!ethers.isAddress(to)) {
      toast({
        title: 'Error',
        description: 'Invalid address',
        type: 'error'
      })

      return
    }
    if (!eth || isNaN(eth)) {
      toast({
        title: 'Error',
        description: 'Invalid ETH amount',
        type: 'error'
      })

      return
    }
    onSubmit({ eth: eth.toString(), to })
    reset()
    onClose()
  }

  function reset() {
    setEth(0)
    setTo('')
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add a transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Transactions will be batched and sent together to your wallet for approval
            <Box mt={4}>
              <label>Amount ETH</label>
              <Input
                placeholder="0.001"
                type="number"
                onChange={event => setEth(event.target.valueAsNumber)}
              />
            </Box>
            <Box mt={4}>
              <label>To</label>
              <Input
                placeholder="0x0..."
                type="text"
                onChange={event => setTo(event.target.value)}
              />
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={onAddTransaction}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
