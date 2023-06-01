import { Button, Modal, Table, Text } from '@nextui-org/react'
import { useState } from 'react'

export function ShowLocalStorageButton() {
  const [visible, setVisible] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(undefined)

  function onOpen() {
    setData(Object.entries(localStorage))
    setVisible(true)
  }

  function onClose() {
    setVisible(false)
  }

  return (
    <>
      <Button size="sm" flat css={{ marginLeft: 15, marginTop: 5, zIndex: 1 }} onPress={onOpen}>
        Show localStorage
      </Button>
      <Modal closeButton aria-labelledby="modal-title" open={visible} onClose={onClose}>
        <Modal.Header>
          <Text size={18}>Local Storage</Text>
        </Modal.Header>
        <Modal.Body css={{ padding: 0 }}>
          <Table lined headerLined shadow={false} css={{ padding: 0 }}>
            <Table.Header>
              <Table.Column>Key</Table.Column>
              <Table.Column>Value</Table.Column>
            </Table.Header>
            <Table.Body>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {data?.map((entry: any) => (
                <Table.Row key={entry[0]}>
                  <Table.Cell>{entry[0]}</Table.Cell>
                  <Table.Cell>{entry[1]}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Modal.Body>
      </Modal>
    </>
  )
}
