'use client'

import { useEffect, useState } from 'react'

import { Card, CardHeader, Code, Heading, Text } from '@chakra-ui/react'

export interface DefaultSIWXStatusProps {
  localStorageKey?: string
}

export function DefaultSIWXStatus({ localStorageKey = '@appkit/siwx' }: DefaultSIWXStatusProps) {
  const [status, setStatus] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      const newStatus = localStorage.getItem(localStorageKey) || ''
      if (newStatus !== status) {
        setStatus(newStatus)
      }
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  if (!status) {
    return null
  }

  return (
    <Card marginTop={10} marginBottom={10}>
      <CardHeader>
        <Heading size="md">SIWX Status</Heading>
      </CardHeader>

      <Text mx="4">Below is shown the data stored for SIWX sessions:</Text>

      <Code m="4" maxH="64" whiteSpace="pre" overflow="auto" variant="outline">
        {JSON.stringify(JSON.parse(status), null, 2)}
      </Code>
    </Card>
  )
}
