import { Image, HStack, Button, Spacer, Link as CLink, useDisclosure } from '@chakra-ui/react'
import Link from 'next/link'
import { IoSettingsOutline } from 'react-icons/io5'
import { OptionsDrawer } from './OptionsDrawer'

export function LayoutHeader() {
  const controls = useDisclosure()

  return (
    <>
      <HStack paddingTop={5} paddingBottom={5} spacing={5}>
        <Link href="/">
          <Image src="/logo.png" width={200} />
        </Link>

        <Spacer />

        <CLink isExternal href="https://github.com/WalletConnect/web3modal">
          GitHub
        </CLink>
        <CLink isExternal href="https://gallery.web3modal.com">
          Gallery
        </CLink>
        <CLink isExternal href="https://docs.walletconnect.com/web3modal/about">
          Docs
        </CLink>
        <Button rightIcon={<IoSettingsOutline />} onClick={controls.onOpen}>
          Options
        </Button>
      </HStack>

      <OptionsDrawer controls={controls} />
    </>
  )
}
