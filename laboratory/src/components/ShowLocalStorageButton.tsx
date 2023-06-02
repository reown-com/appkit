import { Button } from '@nextui-org/react'
import { NotificationCtrl } from '../controllers/NotificationCtrl'

export function ShowLocalStorageButton() {
  function onOpen() {
    NotificationCtrl.open('Local Storage', JSON.stringify(localStorage, null, 2))
  }

  return (
    <>
      <Button size="sm" flat css={{ marginLeft: 15, marginTop: 5, zIndex: 1 }} onPress={onOpen}>
        Show localStorage
      </Button>
    </>
  )
}
