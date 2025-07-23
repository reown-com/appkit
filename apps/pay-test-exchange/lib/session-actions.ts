import { Session } from './types'

interface UpdateSessionOptions {
  shouldCheckResponse?: boolean
}

export async function updateSessionStatus(
  sessionId: string,
  status: Session['status'],
  options: UpdateSessionOptions = {}
): Promise<void> {
  const { shouldCheckResponse = true } = options

  const response = await fetch(`/api/update?sessionId=${sessionId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  })

  if (shouldCheckResponse && !response.ok) {
    throw new Error(`Failed to update session status to ${status}: ${response.statusText}`)
  }
}

export async function createPendingSession(sessionId: string): Promise<void> {
  return updateSessionStatus(sessionId, 'pending', {
    shouldCheckResponse: false
  })
}

export async function markSessionSuccess(sessionId: string): Promise<void> {
  return updateSessionStatus(sessionId, 'success')
}

export async function markSessionError(sessionId: string): Promise<void> {
  return updateSessionStatus(sessionId, 'error')
}
