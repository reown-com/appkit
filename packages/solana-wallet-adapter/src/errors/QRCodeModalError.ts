export class QRCodeModalError extends Error {
  constructor() {
    super()

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, QRCodeModalError.prototype)
  }
}
