import { useState } from 'react'

import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip
} from '@chakra-ui/react'
import { ethers } from 'ethers'

import { useChakraToast } from './Toast'

type IAddTransactionModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (params: { eth: string; to: string; data?: string }) => void
}
export function AddTransactionModal({ isOpen, onClose, onSubmit }: IAddTransactionModalProps) {
  const toast = useChakraToast()
  const [eth, setEth] = useState(0)
  const [to, setTo] = useState('')
  const [data, setData] = useState('')
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')

  function isValidHex(value: string): boolean {
    // Empty is valid (optional field)
    if (!value) {
      return true
    }

    return /^0x[0-9a-fA-F]*$/u.test(value)
  }

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
    if (data && !isValidHex(data)) {
      toast({
        title: 'Error',
        description: 'Invalid hex data format. Must start with 0x',
        type: 'error'
      })

      return
    }
    onSubmit({ eth: eth.toString(), to, data: data || undefined })
    reset()
    onClose()
  }

  function reset() {
    setEth(0)
    setTo('')
    setData('')
    setMode('simple')
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMode(mode === 'simple' ? 'advanced' : 'simple')}
                mb={4}
              >
                {mode === 'simple' ? 'Switch to Advanced Mode' : 'Switch to Simple Mode'}
              </Button>
            </Box>
            <FormControl mt={4}>
              <FormLabel>
                <Tooltip label="The amount of ETH to send in the transaction" placement="top">
                  Amount ETH
                </Tooltip>
              </FormLabel>
              <Input
                placeholder="0.001"
                type="number"
                value={eth || ''}
                onChange={event => setEth(event.target.valueAsNumber)}
              />
              <FormHelperText>Amount in ETH (e.g., 0.001)</FormHelperText>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>
                <Tooltip label="The recipient address for this transaction" placement="top">
                  To Address
                </Tooltip>
              </FormLabel>
              <Input
                placeholder="0x0..."
                type="text"
                value={to}
                onChange={event => setTo(event.target.value)}
              />
              <FormHelperText>Recipient Ethereum address</FormHelperText>
            </FormControl>
            {mode === 'advanced' && (
              <FormControl mt={4}>
                <FormLabel>
                  <Tooltip
                    label="Optional transaction data as hex string (e.g., contract call data)"
                    placement="top"
                  >
                    Data (Optional)
                  </Tooltip>
                </FormLabel>
                <Input
                  placeholder="0x..."
                  type="text"
                  value={data}
                  onChange={event => setData(event.target.value)}
                  isInvalid={data !== '' && !isValidHex(data)}
                />
                <FormHelperText>
                  Hex-encoded transaction data (must start with 0x). Leave empty for simple
                  transfers.
                </FormHelperText>
              </FormControl>
            )}
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
