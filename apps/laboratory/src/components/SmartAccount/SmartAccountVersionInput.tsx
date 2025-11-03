import { useEffect, useState } from 'react'

import { Flex, FormControl, FormLabel, HStack, Radio, RadioGroup, Switch } from '@chakra-ui/react'

function SmartAccountVersionInput() {
  const [smartAccountVersion, setSmartAccountVersion] = useState<'v6' | 'v7'>('v7')
  const [isForced, setIsForced] = useState(false)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('@appkit-wallet/dapp_smart_account_version')
      if (saved === 'v6' || saved === 'v7') {
        setSmartAccountVersion(saved)
        setIsForced(true)
      }
    } catch {
      // No-op
    }
  }, [])

  useEffect(() => {
    try {
      if (isForced) {
        localStorage.setItem('@appkit-wallet/dapp_smart_account_version', smartAccountVersion)
      } else {
        localStorage.removeItem('@appkit-wallet/dapp_smart_account_version')
      }
    } catch {
      // No-op
    }
  }, [isForced, smartAccountVersion])

  return (
    <Flex gridGap="4" flexDirection="column">
      <FormControl>
        <HStack>
          <FormLabel m={0}>Force Smart Account Version</FormLabel>
          <Switch isChecked={isForced} onChange={e => setIsForced(e.target.checked)} />
        </HStack>
      </FormControl>
      <FormControl isDisabled={!isForced}>
        <FormLabel>Smart Account Version</FormLabel>
        <RadioGroup
          onChange={val => setSmartAccountVersion(val as 'v6' | 'v7')}
          value={smartAccountVersion}
        >
          <HStack spacing="4">
            <Radio value="v6">v6</Radio>
            <Radio value="v7">v7</Radio>
          </HStack>
        </RadioGroup>
      </FormControl>
    </Flex>
  )
}

export default SmartAccountVersionInput
