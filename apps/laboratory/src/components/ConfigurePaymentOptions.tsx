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
  Text,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel
} from '@chakra-ui/react'
import { encodeFunctionData, erc20Abi } from 'viem'

import { baseSepolia, sepolia } from '@reown/appkit/networks'

import {
  type EvmContractInteraction,
  type PaymentOption
} from '@/src/types/wallet_checkout'

// Chain IDs for Base Sepolia and Ethereum Sepolia testnets
type AllowedChainId = 84532 | 11155111;

const ALLOWED_CHAINS = [sepolia, baseSepolia]

interface ConfigurePaymentOptionsProps {
  isOpen: boolean
  onClose: () => void
  paymentOptions: PaymentOption[]
  onPaymentOptionsChange: (options: PaymentOption[]) => void;
}

export function ConfigurePaymentOptions({ 
  isOpen, 
  onClose, 
  paymentOptions, 
  onPaymentOptionsChange 
}: ConfigurePaymentOptionsProps) {
  // For editing payment options
  const [editingPaymentOptions, setEditingPaymentOptions] = useState<PaymentOption[]>(paymentOptions)
  const [newRecipient, setNewRecipient] = useState('')
  const [newToken, setNewToken] = useState('')
  const [selectedChainId, setSelectedChainId] = useState<AllowedChainId>(84532)
  const [addressError, setAddressError] = useState<string | null>(null)

  // Helper function to get chain name from chain ID
  function getChainName(chainId: string | number): string {
    const chain = ALLOWED_CHAINS.find(c => c.id === Number(chainId));

    return chain?.name || `Chain ${chainId}`;
  }

  // Token pairs for different chains
  const tokenPairs: Record<number, {address: string, name: string}[]> = {
    [sepolia.id]: [
      {
        address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
        name: 'USDC on Sepolia'
      }
    ],
    [baseSepolia.id]: [
      {
        address: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
        name: 'USDC on Base Sepolia'
      }
    ]
  }

  // Validate Ethereum address format
  function validateAddress(address: string): boolean {
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/u;
    
    return ethAddressRegex.test(address);
  }

  // Handle recipient address change with validation
  function handleRecipientChange(e: React.ChangeEvent<HTMLInputElement>) {
    const address = e.target.value;
    setNewRecipient(address);
    
    if (address && !validateAddress(address)) {
      setAddressError('Invalid Ethereum address format');
    } else {
      setAddressError(null);
    }
  }

  // Remove a payment option
  function handleRemovePaymentOption(index: number) {
    const updated = [...editingPaymentOptions];
    updated.splice(index, 1);
    setEditingPaymentOptions(updated);
  }

  // Add a new payment option
  function handleAddPaymentOption() {
    if (!newRecipient || !newToken || addressError) {
      return;
    }

    // Default amount (100000 = 0.1 USDC)
    const newOption: PaymentOption = {
      recipient: `eip155:${selectedChainId}:${newRecipient}`,
      asset: `eip155:${selectedChainId}/erc20:${newToken}`,
      amount: '0x186A0' as `0x${string}`
    };

    setEditingPaymentOptions([...editingPaymentOptions, newOption]);
    setNewRecipient('');
    setNewToken('');
  }

  // Add a new contract interaction payment option
  function handleAddContractOption() {
    if (!newToken) {
      return;
    }

    // Default amount (100000 = 0.1 USDC)
    const newOption: PaymentOption = {
      asset: `eip155:${selectedChainId}/erc20:${newToken}`,
      amount: '0x186A0' as `0x${string}`,
      contractInteraction: {
        type: 'evm-calls',
        data: [
          {
            to: newToken,
            data: encodeFunctionData({
              abi: erc20Abi,
              functionName: 'transfer',
              args: [newRecipient as `0x${string}` || '0xD39483aE92522cd804CEB9DEA399F62E268297AC' as `0x${string}`, BigInt(100000)]
            }),
            value: '0x0'
          }
        ]
      } as EvmContractInteraction
    };

    setEditingPaymentOptions([...editingPaymentOptions, newOption]);
    setNewToken('');
    setNewRecipient('');
  }

  // Save configuration
  function handleSaveConfig() {
    onPaymentOptionsChange(editingPaymentOptions);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Configure Payment Options</ModalHeader>
        <ModalBody>
          <Tabs variant="enclosed" colorScheme="blue">
            <TabList>
              <Tab>Current Options ({editingPaymentOptions.length})</Tab>
              <Tab>Add New Option</Tab>
            </TabList>
            
            <TabPanels>
              {/* Current Options Tab */}
              <TabPanel px={0}>
                <VStack spacing={4} align="stretch">
                  {editingPaymentOptions.length === 0 ? (
                    <Box p={4} borderRadius="md" textAlign="center">
                      <Text color="gray.500">No payment options configured. Switch to the "Add New Option" tab to add one.</Text>
                    </Box>
                  ) : (
                    editingPaymentOptions.map((option, index) => {
                      // Extract chain ID and recipient from CAIP format
                      const assetParts = option.asset?.split('/') || [];
                      const chainPart = assetParts[0]?.split(':') || [];
                      const tokenPart = assetParts[1]?.split(':') || [];
                      const chainId = chainPart[1] || '';
                      const tokenAddress = tokenPart[1] || '';
                      
                      let recipientAddress = '';
                      if (option.recipient) {
                        const recipientParts = option.recipient.split(':');
                        recipientAddress = recipientParts[2] || '';
                      }
                      
                      const isContractInteraction = Boolean(option.contractInteraction);
                      
                      return (
                        <HStack key={index} p={3} borderRadius="md" justify="space-between" borderWidth="1px" borderColor="gray.200">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="medium">
                              {isContractInteraction ? 'Contract Interaction' : 'Direct Payment'}
                            </Text>
                            <Text fontSize="xs">Chain: {getChainName(chainId)}</Text>
                            <Text fontSize="xs" noOfLines={1}>
                              Token: {tokenAddress}
                            </Text>
                            {recipientAddress && (
                              <Text fontSize="xs" noOfLines={1}>
                                To: {recipientAddress}
                              </Text>
                            )}
                          </VStack>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleRemovePaymentOption(index)}
                          >
                            Remove
                          </Button>
                        </HStack>
                      );
                    })
                  )}
                </VStack>
              </TabPanel>
              
              {/* Add New Option Tab */}
              <TabPanel px={0}>
                <VStack spacing={4} align="stretch">
                  <Box>
                    <Text fontSize="sm" mb={1}>Chain</Text>
                    <Select
                      value={selectedChainId.toString()}
                      onChange={(e) => setSelectedChainId(Number(e.target.value) as AllowedChainId)}
                      size="md"
                      mb={2}
                    >
                      {ALLOWED_CHAINS.map(chain => (
                        <option key={chain.id} value={chain.id}>
                          {chain.name}
                        </option>
                      ))}
                    </Select>
                    
                    <Text fontSize="sm" mb={1}>Recipient Address</Text>
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
                    
                    <Text fontSize="sm" mb={1}>Token</Text>
                    <Select
                      value={newToken}
                      onChange={(e) => setNewToken(e.target.value)}
                      size="md"
                      mb={2}
                    >
                      <option value="">Select a token</option>
                      {tokenPairs[selectedChainId]?.map((token, index) => (
                        <option key={index} value={token.address}>
                          {token.name} ({token.address.substring(0, 6)}...{token.address.substring(token.address.length - 4)})
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
                    <Button
                      onClick={handleAddContractOption}
                      isDisabled={!newToken}
                      size="md"
                      width="full"
                    >
                      Add Contract Payment
                    </Button>
                  </HStack>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>

        <ModalFooter py={2}>
          <Button
            onClick={handleSaveConfig}
            width="full"
            size="md"
          >
            Save Configuration
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
} 