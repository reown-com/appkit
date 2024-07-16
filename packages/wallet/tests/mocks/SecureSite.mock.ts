export const SecureSiteMock = {
  approveRequest: ({ id, type, response }: { id: string; type: string; response: unknown }) =>
    setTimeout(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: `@w3m-frame/${type}_SUCCESS`,
            id,
            payload: response
          }
        })
      )
    }, 0),
  rejectRequest: ({ id, type, message }: { id: string; type: string; message: string }) => {
    setTimeout(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: `@w3m-frame/${type}_ERROR`,
            id,
            payload: {
              message
            }
          }
        })
      )
    }, 0)
  }
}
