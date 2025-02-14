import { type ReactElement, useMemo } from 'react'

import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  CloseButton,
  Spinner,
  useToast
} from '@chakra-ui/react'

type TransactionStatus = 'pending' | 'success' | 'error'

interface ToastState {
  status: TransactionStatus
  hash?: `0x${string}`
  error?: string
}

export function useTransactionToast() {
  const toast = useToast()
  let toastId: string | number | undefined = undefined

  function showToast({ status, hash, error }: ToastState) {
    if (toastId) {
      toast.close(toastId)
    }

    toastId = toast({
      position: 'bottom-right',
      duration: status === 'pending' ? null : 5000,
      render: ({ onClose: onCloseToast }) => (
        <Box maxWidth="400px" width="100%">
          <TransactionToast status={status} hash={hash} error={error} onClose={onCloseToast} />
        </Box>
      ),
      isClosable: status !== 'pending'
    })

    return toastId
  }

  function closeToast() {
    if (toastId) {
      toast.close(toastId)
      toastId = undefined
    }
  }

  return {
    showPendingToast: () => showToast({ status: 'pending' }),
    showSuccessToast: (hash: `0x${string}`) => showToast({ status: 'success', hash }),
    showErrorToast: (error: string) => showToast({ status: 'error', error }),
    closeToast
  }
}

interface TransactionToastProps {
  status: TransactionStatus
  hash?: `0x${string}`
  error?: string
  onClose?: () => void
}

function TransactionToast({
  status,
  hash,
  error,
  onClose
}: TransactionToastProps): ReactElement | null {
  const bgColor = useMemo(() => {
    if (status === 'success') {
      return 'green.500'
    } else if (status === 'error') {
      return 'red.500'
    }

    return 'gray.900'
  }, [status])

  if (status === 'pending') {
    return (
      <Alert status="info" bg={bgColor} color="white">
        <Box display="flex" alignItems="center" width="100%">
          <Spinner size="sm" mr={3} flexShrink={0} />
          <Box flex="1" minWidth="0">
            <AlertTitle>Transaction Pending</AlertTitle>
            <AlertDescription display="block" wordBreak="break-word">
              Please check your wallet. Your transaction is currently being processed..
            </AlertDescription>
          </Box>
        </Box>
      </Alert>
    )
  }

  if (status === 'success') {
    return (
      <Alert status="success" bg={bgColor} color="white">
        <AlertIcon flexShrink={0} />
        <Box flex="1" minWidth="0">
          <AlertTitle>Transaction Successful</AlertTitle>
          <AlertDescription display="block" fontSize="sm" wordBreak="break-word">
            Transaction hash: {hash}
          </AlertDescription>
        </Box>
        <CloseButton onClick={onClose} flexShrink={0} />
      </Alert>
    )
  }

  if (status === 'error') {
    return (
      <Alert status="error" bg={bgColor} color="white">
        <AlertIcon flexShrink={0} />
        <Box flex="1" minWidth="0">
          <AlertTitle>Transaction Failed</AlertTitle>
          <AlertDescription display="block" wordBreak="break-word">
            {error || 'Failed to process transaction'}
          </AlertDescription>
        </Box>
        <CloseButton onClick={onClose} flexShrink={0} />
      </Alert>
    )
  }

  return null
}

export default TransactionToast
