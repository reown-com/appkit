import { useCallback, useEffect, useState } from 'react'

import { Button, Card, CardHeader, Code, Heading } from '@chakra-ui/react'

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
      <SessionAccount />
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

function SessionAccount() {
  const siwx = useAppKitSIWX<CloudAuthSIWX>()
  const [sessionAccount, setSessionAccount] = useState<CloudAuthSIWX.SessionAccount | undefined>(
    undefined
  )
  const [error, setError] = useState<Error | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)

  const handleGetSessionAccount = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(undefined)
      const account = await siwx.getSessionAccount()
      setSessionAccount(account)
    } catch (requestError) {
      setError(requestError as Error)
    } finally {
      setIsLoading(false)
    }
  }, [siwx])

  return (
    <>
      <Heading size="sm" ml={5}>
        Session Account
      </Heading>

      <Button onClick={handleGetSessionAccount} isLoading={isLoading} isDisabled={isLoading}>
        Get Session Account
      </Button>

      {(sessionAccount || error) && (
        <Code m="4" maxH="64" whiteSpace="pre" overflow="auto" variant="outline">
          {JSON.stringify(sessionAccount || error, null, 2)}
        </Code>
      )}
    </>
  )
}
