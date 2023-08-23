import { BsFillSunFill, BsFillMoonFill } from 'react-icons/bs'
import { FaMagic } from 'react-icons/fa'
import {
  Box,
  Container,
  Flex,
  Icon,
  Link,
  Text,
  useColorMode,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  useDisclosure
} from '@chakra-ui/react'
import MixColorInput from '../components/Theming/MixColorInput'
import AccentColorInput from '../components/Theming/AccentColorInput'

export default function Header() {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onClose, onOpen } = useDisclosure()

  return (
    <>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Edit Theme</DrawerHeader>
          <DrawerBody>
            <Flex gridGap="14" flexDirection="column">
              <Flex gridGap="4" flexDirection="column">
                <MixColorInput />
              </Flex>
              <Flex gridGap="4" flexDirection="column">
                <AccentColorInput />
              </Flex>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <Box borderBottom={'1px'}>
        <Container maxW="container.xl" padding={'4'}>
          <Flex justify={['flex-end', 'space-between']} alignItems={'center'}>
            <Text fontSize={'lg'} fontWeight={'bold'} display={['none', 'block']}>
              Web3Modal Lab
            </Text>
            <Flex gridGap={4} alignItems={'center'}>
              <Link isExternal href="https://github.com/WalletConnect/web3modal">
                GitHub
              </Link>
              <Link
                isExternal
                href="https://web3modal-gallery.vercel.app/?path=/docs/assets-icons--docs"
              >
                Gallery
              </Link>
              <Link isExternal href="https://docs.walletconnect.com/2.0/web3modal/about">
                Docs
              </Link>
              <Flex
                justifyContent={'center'}
                alignItems={'center'}
                width={'24px'}
                height={'24px'}
                border={'1px'}
                borderRadius={'full'}
                padding={'4px'}
                onClick={onOpen}
                cursor={'pointer'}
              >
                <Icon width={'12px'} height={'12px'} as={FaMagic} />
              </Flex>{' '}
              {colorMode === 'light' ? (
                <Flex
                  justifyContent={'center'}
                  alignItems={'center'}
                  width={'24px'}
                  height={'24px'}
                  border={'1px'}
                  borderRadius={'full'}
                  padding={'4px'}
                  cursor={'pointer'}
                  onClick={toggleColorMode}
                >
                  <Icon width={'12px'} height={'12px'} as={BsFillMoonFill} />
                </Flex>
              ) : (
                <Flex
                  justifyContent={'center'}
                  alignItems={'center'}
                  width={'24px'}
                  height={'24px'}
                  border={'1px'}
                  borderRadius={'full'}
                  padding={'4px'}
                  cursor={'pointer'}
                  onClick={toggleColorMode}
                >
                  <Icon width={'12px'} height={'12px'} as={BsFillSunFill} />
                </Flex>
              )}
            </Flex>
          </Flex>
        </Container>
      </Box>
    </>
  )
}
