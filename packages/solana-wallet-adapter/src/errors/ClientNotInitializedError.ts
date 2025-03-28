// Taken from https://stackoverflow.com/a/41429145/2247097

export class ClientNotInitializedError extends Error {
  constructor() {
    super()

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ClientNotInitializedError.prototype)
  }
}
