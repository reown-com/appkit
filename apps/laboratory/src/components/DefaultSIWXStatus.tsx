'use client'

import { useCallback, useEffect, useState } from 'react'

import { Card, CardHeader, Code, Heading, Text } from '@chakra-ui/react'

import type { SIWXSession } from '@reown/appkit'
import { useAppKitSIWX } from '@reown/appkit-siwx/react'
import { useAppKitAccount, useAppKitNetwork } from '@reown/appkit/react'

export function DefaultSIWXStatus() {
  const siwx = useAppKitSIWX()
  const { address, isConnected } = useAppKitAccount()
  const { caipNetwork } = useAppKitNetwork()
  const [sessions, setSessions] = useState<SIWXSession[]>([])

  const fetchSessions = useCallback(async () => {
    if (!siwx || !address || !caipNetwork?.caipNetworkId) {
      setSessions([])

      return
    }

    try {
      const result = await siwx.getSessions(caipNetwork.caipNetworkId, address)
      setSessions(result)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to fetch SIWX sessions:', error)
      setSessions([])
    }
  }, [siwx, address, caipNetwork?.caipNetworkId])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Poll for updates since DefaultSIWX doesn't emit events
  useEffect(() => {
    if (!isConnected) {
      return undefined
    }

    const interval = setInterval(fetchSessions, 2000)

    return () => clearInterval(interval)
  }, [isConnected, fetchSessions])

  return (
    <Card marginTop={10} marginBottom={10} data-testid="siwx-status">
      <CardHeader>
        <Heading size="md">SIWX Status</Heading>
      </CardHeader>

      <Text mx="4" mb={4}>
        {sessions.length > 0
          ? 'Below is shown the data stored for SIWX sessions:'
          : 'No SIWX sessions found'}
      </Text>

      {sessions.length > 0 && (
        <Code
          m="4"
          maxH="64"
          whiteSpace="pre"
          overflow="auto"
          variant="outline"
          data-testid="siwx-status-data"
        >
          {JSON.stringify(sessions, null, 2)}
        </Code>
      )}
    </Card>
  )
}
