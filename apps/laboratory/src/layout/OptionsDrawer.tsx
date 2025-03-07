import { useEffect } from 'react'
import { BsFillMoonFill, BsFillSunFill } from 'react-icons/bs'

import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Icon,
  useColorMode,
  useDisclosure
} from '@chakra-ui/react'

import AccentColorInput from '@/src/components/Theming/AccentColorInput'
import BorderRadiusInput from '@/src/components/Theming/BorderRadiusInput'
import MixColorInput from '@/src/components/Theming/MixColorInput'
import QrColorInput from '@/src/components/Theming/QrColorInput'
import { ThemeStore } from '@/src/utils/StoreUtil'

interface Props {
  controls: ReturnType<typeof useDisclosure>
}

export function OptionsDrawer({ controls }: Props) {
  const { colorMode, toggleColorMode } = useColorMode()
  const { isOpen, onClose } = controls

  useEffect(() => {
    if (ThemeStore.state.modal) {
      ThemeStore.state.modal.setThemeMode(colorMode)
    }
  }, [colorMode])

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Edit Theme</DrawerHeader>
        <DrawerBody>
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

          <Flex gridGap="14" flexDirection="column">
            <Flex gridGap="4" flexDirection="column">
              <MixColorInput />
            </Flex>
            <Flex gridGap="4" flexDirection="column">
              <AccentColorInput />
            </Flex>
            <Flex gridGap="4" flexDirection="column">
              <QrColorInput />
            </Flex>
            <Flex gridGap="4" flexDirection="column">
              <BorderRadiusInput />
            </Flex>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
