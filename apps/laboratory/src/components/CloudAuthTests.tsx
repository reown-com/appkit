import { useCallback, useEffect, useState } from 'react'

import {
  Button,
  Card,
  CardHeader,
  Code,
  Divider,
  Flex,
  Heading,
  Text,
  Textarea,
  useToast
} from '@chakra-ui/react'

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
    if (!siwx) {
      return undefined
    }

    siwx.on('sessionChanged', newSession => {
      setSession(newSession)
    })

    return () => {
      siwx.removeAllListeners()
    }
  }, [siwx])

  return (
    <>
      <Heading size="sm">Session Status</Heading>

      <Text>Bellow will be displayed the current SIWX session object when it is validated.</Text>

      <Code
        maxH="64"
        whiteSpace="pre"
        overflow="auto"
        variant="outline"
        data-testid="cloud-auth-session-status"
      >
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
  const toast = useToast()

  const handleGetSessionAccount = useCallback(async () => {
    try {
      if (!siwx) {
        throw new Error('SIWX is not initialized')
      }

      setIsLoading(true)
      setSessionAccount(undefined)
      setError(undefined)

      const account = await siwx.getSessionAccount()
      setSessionAccount(account)
      toast({
        title: 'Session account retrieved',
        description: 'The session account has been retrieved successfully',
        status: 'success'
      })
    } catch (requestError) {
      setError(requestError as Error)
      toast({
        title: 'Error retrieving session account',
        description: (requestError as Error).message,
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }, [siwx])

  return (
    <>
      <Heading size="sm">Session Account</Heading>

      <Text>
        Your are able to get the data stored on the session account of your users by calling the
        &nbsp;<Code>getSessionAccount</Code>&nbsp;method from&nbsp;<Code>CloudAuthSIWX</Code>.
      </Text>

      <Button
        onClick={handleGetSessionAccount}
        isLoading={isLoading}
        isDisabled={isLoading}
        data-testid="cloud-auth-get-session-account-button"
      >
        Get Session Account
      </Button>

      {(sessionAccount || error) && (
        <Flex flexDir="column" gap={2}>
          <Heading size="xs">Result</Heading>
          <Code
            maxH="64"
            whiteSpace="pre"
            overflow="auto"
            variant="outline"
            data-testid="cloud-auth-session-account"
          >
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
  const toast = useToast()

  const handleUpdateSessionAccountMetadata = useCallback(async () => {
    try {
      if (!siwx) {
        throw new Error('SIWX is not initialized')
      }

      setIsLoading(true)
      setError(undefined)

      const metadataObject = JSON.parse(metadata)
      await siwx.setSessionAccountMetadata(metadataObject)
      toast({
        title: 'Metadata updated',
        description: 'The metadata has been updated successfully',
        status: 'success'
      })
    } catch (requestError) {
      setError(requestError as Error)
      toast({
        title: 'Error updating metadata',
        description: (requestError as Error).message,
        status: 'error'
      })
    } finally {
      setIsLoading(false)
    }
  }, [siwx, metadata])

  return (
    <>
      <Heading size="sm">Update Session Account Metadata</Heading>

      <Text>
        Cloud Auth is able to store arbitrary metadata on the session account of your users. This
        can be used to store extra information about your users that are relative to your
        application.
      </Text>

      <Text>
        Fill the input below with something that can be parsed as a JSON object. Then try getting
        the session account again to see the changes. The metadata will be stored at the&nbsp;
        <Code>appKitAccount.metadata</Code>&nbsp;property of the session account object.
      </Text>

      <Textarea
        placeholder='{ "username": "satoshi" }'
        value={metadata}
        onChange={e => setMetadata(e.target.value)}
        data-testid="cloud-auth-update-session-account-metadata"
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
