import { useState } from 'react'

import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Text,
  useDisclosure,
  useToast
} from '@chakra-ui/react'
import { useSnapshot } from 'valtio/react'

import type { AppKitNetwork, CaipNetworkId, ChainNamespace } from '@reown/appkit-common'
import { defineChain } from '@reown/appkit/networks'

import { AppKitStore } from '../utils/AppKitStore'

interface Props {
  controls: ReturnType<typeof useDisclosure>
  onAddNetwork?: (network: AppKitNetwork) => void
}

export function NetworksDrawer({ controls }: Props) {
  const { isOpen, onClose } = controls
  const toast = useToast()
  const { appKit } = useSnapshot(AppKitStore)
  const [networkName, setNetworkName] = useState('')
  const [networkId, setNetworkId] = useState('')
  const [namespaceType, setNamespaceType] = useState<'predefined' | 'custom'>('predefined')
  const [predefinedNamespace, setPredefinedNamespace] = useState<string>('eip155')
  const [customNamespace, setCustomNamespace] = useState<string>('')
  const [nativeCurrency, setNativeCurrency] = useState({ name: '', symbol: '', decimals: 18 })
  const [rpcUrl, setRpcUrl] = useState('')
  const [blockExplorerUrl, setBlockExplorerUrl] = useState('')
  const [iconUrl, setIconUrl] = useState('')

  // Compute the actual chain namespace based on selection type
  const chainNamespace = namespaceType === 'predefined' ? predefinedNamespace : customNamespace

  function handleSubmit() {
    if (!networkName || !networkId || !rpcUrl || !chainNamespace) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true
      })

      return
    }

    // Generate CAIP network ID
    const caipNetworkId = `${chainNamespace}:${networkId}`

    // Create network object
    const network = defineChain({
      id: Number(networkId) || networkId,
      name: networkName,
      nativeCurrency: {
        name: nativeCurrency.name,
        symbol: nativeCurrency.symbol,
        decimals: nativeCurrency.decimals
      },
      rpcUrls: {
        default: { http: [rpcUrl] },
        public: { http: [rpcUrl] }
      },
      blockExplorers: blockExplorerUrl
        ? {
            default: {
              name: networkName,
              url: blockExplorerUrl
            }
          }
        : undefined,

      chainNamespace: chainNamespace as ChainNamespace,
      caipNetworkId: caipNetworkId as CaipNetworkId,
      assets: iconUrl
        ? {
            imageId: networkName.toLowerCase(),
            imageUrl: iconUrl
          }
        : undefined
    })

    appKit?.addNetwork(network.chainNamespace, network)

    toast({
      title: 'Network Added',
      description: `${networkName} has been configured`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })

    // Reset form
    resetForm()
    onClose()
  }

  function resetForm() {
    setNetworkName('')
    setNetworkId('')
    setNamespaceType('predefined')
    setPredefinedNamespace('eip155')
    setCustomNamespace('')
    setNativeCurrency({ name: '', symbol: '', decimals: 18 })
    setRpcUrl('')
    setBlockExplorerUrl('')
    setIconUrl('')
  }

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Add Custom Network</DrawerHeader>
        <DrawerBody>
          <Stack spacing={4}>
            <Text mb={2}>Configure a custom network to add to your AppKit instance</Text>

            <FormControl isRequired>
              <FormLabel>Network Name</FormLabel>
              <Input
                placeholder="e.g. My Custom Network"
                value={networkName}
                onChange={e => setNetworkName(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Chain ID</FormLabel>
              <Input
                placeholder="e.g. 1337"
                value={networkId}
                onChange={e => setNetworkId(e.target.value)}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Chain Namespace</FormLabel>
              <RadioGroup
                onChange={value => setNamespaceType(value as 'predefined' | 'custom')}
                value={namespaceType}
                mb={3}
              >
                <Stack direction="row">
                  <Radio value="predefined">Predefined</Radio>
                  <Radio value="custom">Custom</Radio>
                </Stack>
              </RadioGroup>

              {namespaceType === 'predefined' ? (
                <Select
                  value={predefinedNamespace}
                  onChange={e => setPredefinedNamespace(e.target.value)}
                >
                  <option value="eip155">eip155 (Ethereum)</option>
                  <option value="solana">solana</option>
                  <option value="polkadot">polkadot</option>
                  <option value="bip122">bip122</option>
                </Select>
              ) : (
                <Input
                  placeholder="Enter custom namespace"
                  value={customNamespace}
                  onChange={e => setCustomNamespace(e.target.value)}
                />
              )}
            </FormControl>

            <Box>
              <FormLabel>Native Currency</FormLabel>
              <Stack direction="row" spacing={2}>
                <FormControl>
                  <FormLabel>Name</FormLabel>
                  <Input
                    placeholder="Ether"
                    value={nativeCurrency.name}
                    onChange={e => setNativeCurrency({ ...nativeCurrency, name: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Symbol</FormLabel>
                  <Input
                    placeholder="ETH"
                    value={nativeCurrency.symbol}
                    onChange={e => setNativeCurrency({ ...nativeCurrency, symbol: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Decimals</FormLabel>
                  <NumberInput
                    min={0}
                    max={36}
                    value={nativeCurrency.decimals}
                    onChange={valueString =>
                      setNativeCurrency({
                        ...nativeCurrency,
                        decimals: parseInt(valueString, 10) || 18
                      })
                    }
                  >
                    <NumberInputField placeholder="18" />
                  </NumberInput>
                </FormControl>
              </Stack>
            </Box>

            <FormControl isRequired>
              <FormLabel>RPC URL</FormLabel>
              <Input
                placeholder="e.g. https://my-custom-network.example.com"
                value={rpcUrl}
                onChange={e => setRpcUrl(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Block Explorer URL (Optional)</FormLabel>
              <Input
                placeholder="e.g. https://explorer.example.com"
                value={blockExplorerUrl}
                onChange={e => setBlockExplorerUrl(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Icon URL (Optional)</FormLabel>
              <Input
                placeholder="e.g. https://example.com/icon.svg"
                value={iconUrl}
                onChange={e => setIconUrl(e.target.value)}
              />
            </FormControl>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Add Network
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
