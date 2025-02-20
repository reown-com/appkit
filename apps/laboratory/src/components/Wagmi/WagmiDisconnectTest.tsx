import * as React from 'react'

import { Button } from '@chakra-ui/react'
import { useConnections, useDisconnect } from 'wagmi'

import { useAppKitAccount } from '@reown/appkit/react'

import { useChakraToast } from '@/src/components/Toast'
import { ConstantsUtil } from '@/src/utils/ConstantsUtil'

export function WagmiDisconnectTest() {
  const toast = useChakraToast()

  const { disconnect, isPending } = useDisconnect()
  const connections = useConnections()
  const { isConnected } = useAppKitAccount()

  function onDisconnect() {
    try {
      const connector = connections?.[0]?.connector
      if (!connector) {
        toast({
          title: ConstantsUtil.DisconnectingFailedToastTitle,
          description: 'No connector found',
          type: 'error'
        })

        return
      }
      disconnect(
        { connector },
        {
          onSuccess: () => {
            toast({
              title: ConstantsUtil.DisconnectingSuccessToastTitle,
              description: 'Disconnected',
              type: 'success'
            })
          },
          onError: () => {
            toast({
              title: ConstantsUtil.DisconnectingFailedToastTitle,
              description: 'Failed to disconnect',
              type: 'error'
            })
          }
        }
      )
    } catch (e) {
      toast({
        title: ConstantsUtil.DisconnectingFailedToastTitle,
        description: 'Failed to sign message',
        type: 'error'
      })
    }
  }

  return (
    <>
      <Button onClick={onDisconnect} isDisabled={!isConnected || isPending} isLoading={isPending}>
        Disconnect
      </Button>
    </>
  )
}
