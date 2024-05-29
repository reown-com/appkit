export const InputUtil = {
  /**
   * Custom key down event optimized for numeric inputs which is used on the swap
   * @param event
   * @param value
   * @param onChange
   */
  numericInputKeyDown(
    event: KeyboardEvent,
    currentValue: string | undefined,
    onChange: (value: string) => void
  ) {
    const allowedKeys = [
      'Backspace',
      'Meta',
      'Ctrl',
      'a',
      'A',
      'c',
      'C',
      'x',
      'X',
      'v',
      'V',
      'ArrowLeft',
      'ArrowRight',
      'Tab'
    ]
    const controlPressed = event.metaKey || event.ctrlKey
    const selectAll = event.key === 'a' || event.key === 'A'
    const copyKey = event.key === 'c' || event.key === 'C'
    const pasteKey = event.key === 'v' || event.key === 'V'
    const cutKey = event.key === 'x' || event.key === 'X'

    const isComma = event.key === ','
    const isDot = event.key === '.'
    const isNumericKey = event.key >= '0' && event.key <= '9'

    // If command/ctrl key is not pressed, doesn't allow for a, c, v
    if (!controlPressed && (selectAll || copyKey || pasteKey || cutKey)) {
      event.preventDefault()
    }

    // If current value is zero, and zero is pressed, prevent the zero from being added again
    if (currentValue === '0' && !isComma && !isDot && event.key === '0') {
      event.preventDefault()
    }

    // If current value is zero and any numeric key is pressed, replace the zero with the number
    if (currentValue === '0' && isNumericKey) {
      onChange(event.key)
      event.preventDefault()
    }

    if (isComma || isDot) {
      // If the first character is a dot or comma, add a zero before it
      if (!currentValue) {
        onChange('0.')
        event.preventDefault()
      }

      // If the current value already has a dot or comma, prevent the new one from being added
      if (currentValue?.includes('.') || currentValue?.includes(',')) {
        event.preventDefault()
      }
    }

    // If the character is not allowed and it's not a dot or comma, prevent it
    if (!isNumericKey && !allowedKeys.includes(event.key) && !isDot && !isComma) {
      event.preventDefault()
    }
  }
}
