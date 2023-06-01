import { Button } from '@nextui-org/react'

export function ClearLocalStorageButton() {
  function clearLocalStorage() {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <Button
      size="sm"
      flat
      onClick={clearLocalStorage}
      css={{ marginLeft: 15, marginTop: 5, zIndex: 1 }}
    >
      Clear localStorage
    </Button>
  )
}
