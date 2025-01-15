'use client'

import { useEffect, useState } from 'react'

import { Box } from '@chakra-ui/react'

export default function IframeTest() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    setShouldRender(true)
  }, [])

  return (
    <Box border="1px solid black" height="50vh" width="full">
      {shouldRender && <iframe src={window.location.origin} width="100%" height="100%"></iframe>}
    </Box>
  )
}
