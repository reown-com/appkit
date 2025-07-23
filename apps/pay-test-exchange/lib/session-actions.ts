import { Session } from './types'

interface UpdateSessionOptions {
  checkResponse?: boolean
}

export async function updateSessionStatus(
  sessionId: string,
  status: Session['status'],
  options: UpdateSessionOptions = {}
): Promise<void> {
  const { checkResponse = true } = options

  try {
    const response = await fetch(`/api/update?sessionId=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    })

    if (checkResponse && !response.ok) {
      throw new Error(`Failed to update session status to ${status}: ${response.statusText}`)
    }
  } catch (error) {
    console.error(`Error updating session status to ${status}:`, error)
    throw error
  }
}

export async function createPendingSession(sessionId: string): Promise<void> {
  return updateSessionStatus(sessionId, 'pending', {
    checkResponse: false
  })
}

export async function markSessionSuccess(sessionId: string): Promise<void> {
  return updateSessionStatus(sessionId, 'success')
}

export async function markSessionError(sessionId: string): Promise<void> {
  return updateSessionStatus(sessionId, 'error')
}
