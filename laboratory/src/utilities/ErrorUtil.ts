import { showToast } from 'laboratory/src/components/Toast'

export function showErrorToast(error: string) {
  showToast.error(error, { duration: 2000 })
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Something went wrong...'
}
