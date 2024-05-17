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
import { useState, type ChangeEvent } from 'react'
import { CUSTOM_WALLET } from '../utils/ConstantsUtil'

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
    localStorage.setItem(CUSTOM_WALLET, JSON.stringify(customWallet))
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
          Add a custom wallets to the modal. This feature is for wallets that are under the Explorer
          submission process.{' '}
          <Link
            isExternal
            color="blue.500"
            href="https://docs.walletconnect.com/cloud/explorer-submission#how-do-we-test-wallets"
          >
            Learn more.
          </Link>
        </Text>
        <DrawerBody>
          <Stack spacing={4}>
            Name
            <Input
              name="name"
              value={customWallet.name}
              onChange={handleChange}
              variant="outline"
              placeholder="Name"
            />
            Image URL
            <Input
              name="image_url"
              value={customWallet.image}
              onChange={handleChange}
              variant="outline"
              placeholder="Image URL"
            />
            Mobile Linking (Optional)
            <Input
              name="mobile_link"
              value={customWallet.mobile}
              onChange={handleChange}
              variant="outline"
              placeholder="Mobile Linking"
            />
            Desktop Linking (Optional)
            <Input
              name="desktop_link"
              value={customWallet.desktop}
              onChange={handleChange}
              variant="outline"
              placeholder="Desktop Linking"
            />
            Webapp Linking (Optional)
            <Input
              name="webapp_link"
              value={customWallet.webapp}
              onChange={handleChange}
              variant="outline"
              placeholder="Webapp Linking"
            />
            <Button onClick={handleCustomWallet}>Add Wallet</Button>
          </Stack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
