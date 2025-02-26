import { type ChangeEvent, useState } from 'react'

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
  useDisclosure
} from '@chakra-ui/react'

import { CUSTOM_WALLET } from '@/src/utils/ConstantsUtil'
import { setLocalStorageItem } from '@/src/utils/LocalStorage'

interface Props {
  controls: ReturnType<typeof useDisclosure>
}

export function CustomWallet({ controls }: Props) {
  const [customWallet, setCustomWallet] = useState({
    id: 'custom',
    name: '',
    image_url: '',
    mobile_link: '',
    desktop_link: '',
    webapp_link: ''
  })

  function handleCustomWallet() {
    setLocalStorageItem(CUSTOM_WALLET, JSON.stringify(customWallet))
    location.reload()
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
            />
            <Input
              name="image_url"
              value={customWallet.image_url}
              onChange={handleChange}
              variant="outline"
              placeholder="Image URL"
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
            <Button onClick={handleCustomWallet}>Add Wallet</Button>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
