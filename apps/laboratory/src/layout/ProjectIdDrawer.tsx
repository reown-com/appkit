import { type ChangeEvent, useEffect, useState } from 'react'

import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useDisclosure,
  useToast
} from '@chakra-ui/react'

import { useProjectId } from '../hooks/useProjectId'

interface Props {
  controls: ReturnType<typeof useDisclosure>
}

export function ProjectIdDrawer({ controls }: Props) {
  const { isOpen, onClose } = controls
  const toast = useToast()
  const { projectId: currentProjectId, setProjectId } = useProjectId()
  const [inputValue, setInputValue] = useState(currentProjectId || '')

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value)
  }

  function handleSave() {
    if (!inputValue.trim()) {
      toast({
        title: 'Project ID cannot be empty',
        description: 'Please enter a valid Project ID.',
        status: 'error',
        duration: 3000,
        isClosable: true
      })

      return
    }
    setProjectId(inputValue.trim())
    toast({
      title: 'Project ID Saved',
      description: `Project ID has been set to ${inputValue.trim()}`,
      status: 'success',
      duration: 3000,
      isClosable: true
    })
    onClose()
  }

  function handleClear() {
    setInputValue('')
    setProjectId(undefined)
    toast({
      title: 'Project ID Cleared',
      description: 'Project ID has been cleared.',
      status: 'info',
      duration: 3000,
      isClosable: true
    })
    onClose()
  }

  useEffect(() => {
    setInputValue(currentProjectId || '')
  }, [currentProjectId])

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Set Custom Project ID</DrawerHeader>
        <DrawerBody>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Project ID</FormLabel>
              <Input
                placeholder="Enter your Project ID"
                value={inputValue}
                data-testid="project-id-input"
                onChange={handleChange}
              />
            </FormControl>
          </Stack>
        </DrawerBody>
        <DrawerFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button variant="ghost" mr={3} onClick={handleClear} isDisabled={!currentProjectId}>
            Clear Project ID
          </Button>
          <Button data-testid="project-id-save-button" colorScheme="blue" onClick={handleSave}>
            Save Project ID
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
