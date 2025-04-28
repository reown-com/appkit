'use client'

import { useEffect, useState } from 'react'

import {
  Button,
  Link as CLink,
  HStack,
  Image,
  Spacer,
  Stack,
  Text,
  useColorMode,
  useDisclosure
} from '@chakra-ui/react'
import { DownloadIcon, GearIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useChakraToast } from '@/src/components/Toast'
import { DOCS_URL, GALLERY_URL, REPO_URL } from '@/src/utils/ConstantsUtil'

import { CustomWallet } from './CustomWallet'
import { NetworksDrawer } from './NetworksDrawer'
import { OptionsDrawer } from './OptionsDrawer'

function downloadLogs(toast: ReturnType<typeof useChakraToast>) {
  type WindowWithLogs = typeof Window & {
    downloadLogsBlobInBrowser?: () => void
    downloadAppKitLogsBlob: Record<string, () => void>
  }

  const logWindow = window as unknown as WindowWithLogs
  logWindow.downloadLogsBlobInBrowser?.()
  logWindow.downloadAppKitLogsBlob?.['sdk']?.()
  toast({
    title: 'Logs downloaded',
    description:
      'To get logs for secure site too, switch to it in developer console and run `window.downloadLogsBlobInBrowser()`',
    type: 'success'
  })
}

export function LayoutHeader() {
  const pathname = usePathname()
  const controls = useDisclosure()
  const controlsCW = useDisclosure({ id: 'customWallet' })
  const controlsNW = useDisclosure({ id: 'networks' })
  const toast = useChakraToast()
  const { colorMode } = useColorMode()
  const [origin, setOrigin] = useState('')
  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  return (
    <>
      <Stack direction={['column', 'column', 'row']} marginBlockStart={10} justifyContent="center">
        <Link href="/">
          <Image src={`/logo-${colorMode}.svg`} width={200} />
        </Link>

        <Spacer />

        <HStack spacing={5} marginRight={[0, 0, 5]} marginTop={[3, 3, 0]} marginBottom={[3, 3, 0]}>
          <CLink isExternal href={REPO_URL}>
            GitHub
          </CLink>
          <CLink isExternal href={GALLERY_URL}>
            Gallery
          </CLink>
          <CLink isExternal href={DOCS_URL}>
            Docs
          </CLink>
        </HStack>

        <Button rightIcon={<GearIcon />} onClick={controlsCW.onOpen}>
          Custom Wallet
        </Button>
        <Button rightIcon={<GearIcon />} onClick={controlsNW.onOpen}>
          Networks
        </Button>
        <Button rightIcon={<GearIcon />} onClick={controls.onOpen}>
          Options
        </Button>
        <Button rightIcon={<DownloadIcon />} onClick={() => downloadLogs(toast)}>
          Logs
        </Button>
      </Stack>
      <Text fontSize="2xs">{origin + pathname}</Text>

      <OptionsDrawer controls={controls} />
      <OptionsDrawer controls={controls} />
      <NetworksDrawer controls={controlsNW} />
      <CustomWallet controls={controlsCW} />
    </>
  )
}
