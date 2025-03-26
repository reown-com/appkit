import { useEffect, useState } from 'react'

import { Card, CardHeader, Code, Heading } from '@chakra-ui/react'

import type { SIWXSession } from '@reown/appkit'
import type { CloudAuthSIWX } from '@reown/appkit-siwx'
import { useAppKitSIWX } from '@reown/appkit-siwx/react'

export function CloudAuthTests() {
  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Cloud Auth Interactions</Heading>
      </CardHeader>

      <SessionStatus />
    </Card>
  )
}

function SessionStatus() {
  const siwx = useAppKitSIWX<CloudAuthSIWX>()
  const [session, setSession] = useState<SIWXSession | undefined>(undefined)

  useEffect(() => {
    siwx.on('session-changed', newSession => {
      setSession(newSession)
    })

    return () => {
      siwx.removeAllListeners()
    }
  }, [])

  return (
    <>
      <Heading size="sm" ml={5}>
        Session Status
      </Heading>

      <Code m="4" maxH="64" whiteSpace="pre" overflow="auto" variant="outline">
        {session ? JSON.stringify(session, null, 2) : 'No session detected yet'}
      </Code>
    </>
  )
}
