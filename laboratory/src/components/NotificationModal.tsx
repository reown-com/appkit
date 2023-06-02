import { Modal, Text } from '@nextui-org/react'
import { useSnapshot } from 'valtio'
import { NotificationCtrl } from '../controllers/NotificationCtrl'

export function NotificationModal() {
  const { open, title, body } = useSnapshot(NotificationCtrl.state)

  return (
    <Modal scroll fullScreen closeButton open={open} onClose={NotificationCtrl.close}>
      <Modal.Header>
        <Text h3>{title}</Text>
      </Modal.Header>
      <Modal.Body>
        <pre>{body}</pre>
      </Modal.Body>
    </Modal>
  )
}
