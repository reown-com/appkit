import { useCallback, useEffect, useState } from 'react'

import { Button, Card, CardHeader, Code, Divider, Flex, Heading, Textarea } from '@chakra-ui/react'

import type { SIWXSession } from '@reown/appkit'
import type { CloudAuthSIWX } from '@reown/appkit-siwx'
import { useAppKitSIWX } from '@reown/appkit-siwx/react'

export function CloudAuthTests() {
  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">Cloud Auth Interactions</Heading>
      </CardHeader>

      <Flex gap={5} p={5} flexDir="column">
        <SessionStatus />
        <Divider />
        <SessionAccount />
        <Divider />
        <UpdateSessionAccountMetadata />
      </Flex>
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
      <Heading size="sm">Session Status</Heading>

      <Code maxH="64" whiteSpace="pre" overflow="auto" variant="outline">
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
      setSessionAccount(undefined)
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
      <Heading size="sm">Session Account</Heading>

      <Button onClick={handleGetSessionAccount} isLoading={isLoading} isDisabled={isLoading}>
        Get Session Account
      </Button>

      {(sessionAccount || error) && (
        <Flex flexDir="column" gap={2}>
          <Heading size="xs">Result</Heading>
          <Code maxH="64" whiteSpace="pre" overflow="auto" variant="outline">
            {sessionAccount
              ? JSON.stringify(sessionAccount, null, 2)
              : error?.message || 'unknown error'}
          </Code>
        </Flex>
      )}
    </>
  )
}

function UpdateSessionAccountMetadata() {
  const siwx = useAppKitSIWX<CloudAuthSIWX>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | undefined>(undefined)
  const [metadata, setMetadata] = useState<string>('')

  const handleUpdateSessionAccountMetadata = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(undefined)

      const metadataObject = JSON.parse(metadata)
      await siwx.setSessionAccountMetadata(metadataObject)
    } catch (requestError) {
      setError(requestError as Error)
    } finally {
      setIsLoading(false)
    }
  }, [siwx, metadata])

  return (
    <>
      <Heading size="sm">Update Session Account Metadata</Heading>

      <Textarea
        placeholder='{ "username": "satoshi" }'
        value={metadata}
        onChange={e => setMetadata(e.target.value)}
      />

      <Button
        onClick={handleUpdateSessionAccountMetadata}
        isLoading={isLoading}
        isDisabled={isLoading}
      >
        Update Session Account Metadata
      </Button>

      {error && (
        <Flex flexDir="column" gap={2}>
          <Heading size="xs">Error</Heading>
          <Code maxH="64" whiteSpace="pre" overflow="auto" variant="outline">
            {error.message}
          </Code>
        </Flex>
      )}
    </>
  )
}
