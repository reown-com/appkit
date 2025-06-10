import { type ChangeEvent, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Link,
  Stack,
  Text,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import { SafeLocalStorage, SafeLocalStorageKeys } from '@reown/appkit-common'

interface Props {
  controls: ReturnType<typeof useDisclosure>
}

interface CustomWalletData {
  id: string
  name: string
  image_url: string
  mobile_link: string
  desktop_link: string
  webapp_link: string
}

export function CustomWallet({ controls }: Props) {
  const toast = useToast()
  const [customWallet, setCustomWallet] = useState<CustomWalletData>({
    id: uuidv4(),
    name: '',
    image_url: '',
    mobile_link: '',
    desktop_link: '',
    webapp_link: ''
  })

  function handleCustomWallet() {
    try {
      // Get existing custom wallets
      const existingWallets = SafeLocalStorage.getItem(SafeLocalStorageKeys.CUSTOM_WALLETS)
      const customWallets = existingWallets ? JSON.parse(existingWallets) : []
      
      // Check for duplicate wallet name
      const isDuplicate = customWallets.some((w: any) => w.name.toLowerCase() === customWallet.name.toLowerCase())
      if (isDuplicate) {
        toast({
          title: 'Error',
          description: 'A wallet with this name already exists',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }

      // Generate unique ID if needed
      let walletId = customWallet.id
      while (customWallets.some((w: any) => w.id === walletId)) {
        walletId = uuidv4()
      }
      
      // Add new wallet to the list with unique ID
      customWallets.push({
        ...customWallet,
        id: walletId
      })
      
      // Save updated list
      SafeLocalStorage.setItem(SafeLocalStorageKeys.CUSTOM_WALLETS, JSON.stringify(customWallets))
      
      // Show success message
      toast({
        title: 'Custom wallet added',
        description: `${customWallet.name} has been added successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      // Reset form
      setCustomWallet({
        id: uuidv4(),
        name: '',
        image_url: '',
        mobile_link: '',
        desktop_link: '',
        webapp_link: ''
      })
      
      // Close drawer
      controls.onClose()
    } catch (error) {
      console.error('Error adding custom wallet:', error)
      toast({
        title: 'Error',
        description: 'Failed to add custom wallet',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    setCustomWallet(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const { isOpen, onClose } = controls

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Add a Custom Wallet</DrawerHeader>
        <Text pt="2" fontSize="sm" padding={6}>
          Add a custom wallet to the modal. This feature is for wallets that are under the Explorer
          submission process.{' '}
          <Link
            isExternal
            color="blue.500"
            href="https://docs.reown.com/cloud/explorer-submission#how-do-we-test-wallets"
          >
            Learn more.
          </Link>
        </Text>
        <DrawerBody>
          <Stack spacing={4}>
            <Input
              name="name"
              value={customWallet.name}
              onChange={handleChange}
              variant="outline"
              placeholder="Name"
              isRequired
            />
            <Input
              name="image_url"
              value={customWallet.image_url}
              onChange={handleChange}
              variant="outline"
              placeholder="Image URL"
              isRequired
            />
            <Input
              name="mobile_link"
              value={customWallet.mobile_link}
              onChange={handleChange}
              variant="outline"
              placeholder="Mobile Linking (Optional)"
            />
            <Input
              name="desktop_link"
              value={customWallet.desktop_link}
              onChange={handleChange}
              variant="outline"
              placeholder="Desktop Linking (Optional)"
            />
            <Input
              name="webapp_link"
              value={customWallet.webapp_link}
              onChange={handleChange}
              variant="outline"
              placeholder="Webapp Linking (Optional)"
            />
            <Button 
              onClick={handleCustomWallet}
              isDisabled={!customWallet.name || !customWallet.image_url}
            >
              Add Wallet
            </Button>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
