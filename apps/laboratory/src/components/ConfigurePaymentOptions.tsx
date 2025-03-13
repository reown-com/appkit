import { useState } from 'react'
import React from 'react'

import {
  Box,
  Button,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack
} from '@chakra-ui/react'
import { isAddress } from 'viem'

import { type PaymentOption } from '@/src/types/wallet_checkout'
import {
  ALLOWED_CHAINS,
  type AllowedChainId,
  getChainName,
  getTokenOptions,
  getTokenSymbolByAddress,
  shortenAddress
} from '@/src/utils/WalletCheckoutUtil'

interface ConfigurePaymentOptionsProps {
  isOpen: boolean
  onClose: () => void
  paymentOptions: PaymentOption[]
  onPaymentOptionsChange: (options: PaymentOption[]) => void
}

export function ConfigurePaymentOptions({
  isOpen,
  onClose,
  paymentOptions,
  onPaymentOptionsChange
}: ConfigurePaymentOptionsProps) {
  // For managing draft payment options
  const [draftPaymentOptions, setDraftPaymentOptions] = useState<PaymentOption[]>(paymentOptions)
  const [newRecipient, setNewRecipient] = useState('')
  const [newToken, setNewToken] = useState('')
  const [selectedChainId, setSelectedChainId] = useState<AllowedChainId>(84532)
  const [addressError, setAddressError] = useState<string | null>(null)

  // Handle recipient address change with validation
  function handleRecipientChange(e: React.ChangeEvent<HTMLInputElement>) {
    const address = e.target.value
    setNewRecipient(address)

    if (address && !isAddress(address)) {
      setAddressError('Invalid Ethereum address format')
    } else {
      setAddressError(null)
    }
  }

  // Remove a payment option
  function handleRemovePaymentOption(index: number) {
    const updated = [...draftPaymentOptions]
    updated.splice(index, 1)
    setDraftPaymentOptions(updated)
  }

  // Add a new payment option
  function handleAddPaymentOption() {
    if (!newRecipient || !newToken || addressError) {
      return
    }

    // Default amount (100000 = 0.1 USDC)
    const newOption: PaymentOption = {
      recipient: `eip155:${selectedChainId}:${newRecipient}`,
      asset: `eip155:${selectedChainId}/erc20:${newToken}`,
      amount: '0x186A0' as `0x${string}`
    }

    setDraftPaymentOptions([...draftPaymentOptions, newOption])
    setNewRecipient('')
    setNewToken('')
  }

  // Save configuration
  function handleSaveConfig() {
    onPaymentOptionsChange(draftPaymentOptions)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Configure Payment Options</ModalHeader>
        <ModalBody>
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>Current Options ({draftPaymentOptions.length})</Tab>
              <Tab>Add New Option</Tab>
            </TabList>

            <TabPanels>
              {/* Current Options Tab */}
              <TabPanel px={0}>
                <VStack spacing={4} align="stretch">
                  {draftPaymentOptions.length === 0 ? (
                    <Box p={4} borderRadius="md" textAlign="center">
                      <Text color="gray.500">
                        No payment options configured. Switch to the "Add New Option" tab to add
                        one.
                      </Text>
                    </Box>
                  ) : (
                    draftPaymentOptions.map((option, index) => {
                      const tokenSymbol = getTokenSymbolByAddress(option.asset)

                      const assetStr = option.asset ?? ''
                      const chainId = assetStr.split('/')[0]?.split(':')[1] ?? ''
                      const chainName = getChainName(chainId)

                      const tokenAddress = assetStr.split('/')[1]?.split(':')[1] ?? ''
                      const tokenAddressDisplay = shortenAddress(tokenAddress)

                      return (
                        <Box key={index} p={4} borderWidth="1px" borderRadius="md" mb={2}>
                          <HStack justify="space-between">
                            <VStack align="start" spacing={1}>
                              <Text fontSize="sm" fontWeight="bold">
                                {option.contractInteraction
                                  ? 'Contract Interaction'
                                  : 'Direct Payment'}
                              </Text>
                              <Text fontSize="sm">Chain: {chainName}</Text>
                              <Text fontSize="sm">
                                Token:{' '}
                                {tokenSymbol
                                  ? tokenSymbol
                                  : `Unknown Token (${tokenAddressDisplay})`}
                              </Text>
                              {option.recipient && (
                                <Text fontSize="sm">
                                  Recipient: {shortenAddress(option.recipient)}
                                </Text>
                              )}
                            </VStack>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleRemovePaymentOption(index)}
                            >
                              Remove
                            </Button>
                          </HStack>
                        </Box>
                      )
                    })
                  )}
                </VStack>
              </TabPanel>

              {/* Add New Option Tab */}
              <TabPanel px={0}>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" mb={1}>
                      Chain
                    </Text>
                    <Select
                      value={selectedChainId.toString()}
                      onChange={e => setSelectedChainId(Number(e.target.value) as AllowedChainId)}
                      size="md"
                      mb={2}
                    >
                      {ALLOWED_CHAINS.map(chain => (
                        <option key={chain.id} value={chain.id}>
                          {chain.name}
                        </option>
                      ))}
                    </Select>

                    <Text fontSize="sm" mb={1}>
                      Recipient Address
                    </Text>
                    <Input
                      value={newRecipient}
                      onChange={handleRecipientChange}
                      placeholder="0x..."
                      isInvalid={Boolean(addressError)}
                      size="md"
                      mb={2}
                    />
                    {addressError && (
                      <Text fontSize="xs" color="red.500" mb={2}>
                        {addressError}
                      </Text>
                    )}

                    <Text fontSize="sm" mb={1}>
                      Token
                    </Text>
                    <Select
                      value={newToken}
                      onChange={e => setNewToken(e.target.value)}
                      size="md"
                      mb={2}
                    >
                      <option value="">Select a token</option>
                      {getTokenOptions(selectedChainId).map(token => (
                        <option key={token.address} value={token.address}>
                          {token.symbol} ({token.address.substring(0, 6)}...
                          {token.address.substring(token.address.length - 4)})
                        </option>
                      ))}
                    </Select>
                  </Box>

                  <HStack>
                    <Button
                      onClick={handleAddPaymentOption}
                      isDisabled={!newRecipient || !newToken || Boolean(addressError)}
                      size="md"
                      width="full"
                    >
                      Add Direct Payment
                    </Button>
                  </HStack>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter py={2}>
          <Button onClick={handleSaveConfig} width="full" size="md">
            Save Configuration
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
