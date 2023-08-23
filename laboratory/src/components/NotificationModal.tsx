import { Modal, Text } from '@nextui-org/react'
import { useSnapshot } from 'valtio'
import { NotificationCtrl } from '../controllers/NotificationCtrl'

export function NotificationModal() {
  const { open, title, body } = useSnapshot(NotificationCtrl.state)

  return (
    <Modal
      scroll
      fullScreen
      closeButton
      open={open}
      onClose={NotificationCtrl.close}
      css={{ maxWidth: 900, margin: '0 auto' }}
    >
      <Modal.Header>
        <Text h3 data-testid="notification-header">
          {title}
        </Text>
      </Modal.Header>
      <Modal.Body
        css={{
          border: '1px solid rgba(255, 255, 255, 0.2)',
          margin: 10,
          borderRadius: 16,
          padding: 0
        }}
        data-testid="notification-body"
      >
        <pre>{body}</pre>
      </Modal.Body>
    </Modal>
  )
}
