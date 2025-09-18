declare global {
  interface String {
    capitalize(): string
  }
}

if (!Object.prototype.hasOwnProperty.call(String.prototype, 'capitalize')) {
  Object.defineProperty(String.prototype, 'capitalize', {
    value: function () {
      const str = String(this)
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : str
    },
    writable: true,
    configurable: true
  })
}

export {}
