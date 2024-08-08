export const SecureSiteMock = {
  approveRequest: ({ id, type, response }: { id: string; type: string; response: unknown }) => {
    Promise.resolve().then(() =>
      window.dispatchEvent(
        new MessageEvent('message', {
          data: {
            type: `@w3m-frame/${type}_SUCCESS`,
            id,
            payload: response
          }
        })
      )
    )
  },
  rejectRequest: ({ id, type, message }: { id: string; type: string; message: string }) => {
    Promise.resolve().then(() =>
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
    )
  }
}
