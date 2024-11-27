import * as React from 'react'
import { Box, Button, Text, useToast } from '@chakra-ui/react'
import { CopyIcon, CloseIcon } from '@chakra-ui/icons'

type CustomToastProps = {
  allowCopy?: boolean
  title: string
  description: string | Uint8Array | undefined
  type?: 'success' | 'error'
  onClose?: () => void
}

export default function CustomToast({
  allowCopy = true,
  title,
  description,
  type,
  onClose
}: CustomToastProps) {
  const [copied, setCopied] = React.useState(false)

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toastBg = React.useMemo(() => {
    if (type === 'success') {
      return 'green.500'
    } else if (type === 'error') {
      return 'red.500'
    }

    return 'gray.900'
  }, [type])

  return (
    <Box
      color="white"
      display="flex"
      flexDirection="column"
      gap="2"
      p={3}
      bg={toastBg}
      borderRadius="md"
    >
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Text size="lg" fontWeight={600}>
          {title}
        </Text>
        <Button id="toast-close-button" size="xs" onClick={onClose}>
          <CloseIcon width="2" height="2" />
        </Button>
      </Box>
      {description ? (
        <Box display="flex" flexDirection="row" alignItems="center" gap="4">
          <Text noOfLines={2}>{description}</Text>
          {allowCopy && typeof description === 'string' && type !== 'error' ? (
            <Button minWidth="auto" size="xs" onClick={() => copyToClipboard(description)}>
              <CopyIcon width="3" height="3" marginRight="2" />
              <Text>{copied ? 'Signature copied' : 'Copy'}</Text>
            </Button>
          ) : null}
        </Box>
      ) : null}
    </Box>
  )
}

export function useChakraToast() {
  const chakraToast = useToast()

  function toast(params: CustomToastProps) {
    return chakraToast({
      position: 'bottom-right',
      render: ({ onClose }) => (
        <CustomToast
          title={params.title}
          description={params.description}
          type={params.type}
          onClose={onClose}
          allowCopy={params.allowCopy}
        />
      )
    })
  }

  return toast
}
