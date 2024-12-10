/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AppKitOptions } from '@reown/appkit'
import React from 'react'
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardBody,
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Switch,
  Select,
  Textarea,
  Collapse,
  useDisclosure,
  IconButton,
  Checkbox,
  CheckboxGroup
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'
import { siweConfig } from '../utils/SiweUtils'
import { DefaultSIWX } from '@reown/appkit-siwx'
import { useOptions } from '../context/OptionsContext'

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function OptionsPage() {
  const { options, updateOptions } = useOptions()
  const jsonEditorDisclosure = useDisclosure()

  function handleChange(key: keyof AppKitOptions, value: any) {
    updateOptions({ [key]: value })
  }

  function handleFeatureChange(key: keyof typeof options.features, value: any) {
    updateOptions({
      features: {
        ...options.features,
        [key]: value
      }
    })
  }

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Stack spacing={8}>
        <Heading size="lg">AppKit Configuration</Heading>

        <Stack spacing={8}>
          {/* Core Configuration */}
          <Card>
            <CardHeader>
              <Heading size="sm">Core Configuration</Heading>
            </CardHeader>
            <CardBody>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl>
                  <FormLabel>Default Network</FormLabel>
                  <Select
                    value={options.defaultNetwork?.id}
                    onChange={e =>
                      handleChange(
                        'defaultNetwork',
                        options.networks.find(n => n.id === e.target.value)
                      )
                    }
                  >
                    {options.networks.map(network => (
                      <option key={network.id} value={network.id}>
                        {network.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </CardBody>
          </Card>

          {/* Wallet Configuration */}
          <Card>
            <CardHeader>
              <Heading size="sm">Wallet Configuration</Heading>
            </CardHeader>
            <CardBody>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <FormControl>
                  <FormLabel>Enable WalletConnect</FormLabel>
                  <Switch
                    isChecked={options.enableWalletConnect}
                    onChange={e => handleChange('enableWalletConnect', e.target.checked)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Enable Injected</FormLabel>
                  <Switch
                    isChecked={options.enableInjected}
                    onChange={e => handleChange('enableInjected', e.target.checked)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Enable EIP6963</FormLabel>
                  <Switch
                    isChecked={options.enableEIP6963}
                    onChange={e => handleChange('enableEIP6963', e.target.checked)}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Enable Coinbase</FormLabel>
                  <Switch
                    isChecked={options.enableCoinbase}
                    onChange={e => handleChange('enableCoinbase', e.target.checked)}
                  />
                </FormControl>
              </Grid>
            </CardBody>
          </Card>

          {/* Features Configuration */}
          <Card>
            <CardHeader>
              <Heading size="sm">Features</Heading>
            </CardHeader>
            <CardBody>
              <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                {Object.entries(options?.features || {}).map(([key, value]) =>
                  key === 'socials' ? null : (
                    <FormControl key={key}>
                      <FormLabel>{capitalize(key)}</FormLabel>
                      <Switch
                        isChecked={Boolean(value)}
                        onChange={e =>
                          handleFeatureChange(
                            key as keyof typeof options.features,
                            e.target.checked
                          )
                        }
                      />
                    </FormControl>
                  )
                )}
              </Grid>

              <FormControl mt={4}>
                <FormLabel>Social Logins</FormLabel>
                <CheckboxGroup
                  value={options.features?.socials === false ? [] : options.features?.socials}
                  onChange={values => handleFeatureChange('socials', values)}
                >
                  <Grid templateColumns="repeat(4, 1fr)" gap={2}>
                    {['google', 'x', 'discord', 'farcaster', 'github', 'apple', 'facebook'].map(
                      social => (
                        <Checkbox key={social} value={social}>
                          {capitalize(social)}
                        </Checkbox>
                      )
                    )}
                  </Grid>
                </CheckboxGroup>
              </FormControl>
            </CardBody>
          </Card>

          {/* SIWE/SIWX Configuration */}
          <Card>
            <CardHeader>
              <Heading size="sm">Sign-In Configuration</Heading>
            </CardHeader>
            <CardBody>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Enable SIWX</FormLabel>
                  <Switch
                    isChecked={Boolean(options.siwx)}
                    onChange={e =>
                      handleChange('siwx', e.target.checked ? new DefaultSIWX() : undefined)
                    }
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Enable SIWE</FormLabel>
                  <Switch
                    isChecked={Boolean(options.siweConfig)}
                    onChange={e =>
                      handleChange('siweConfig', e.target.checked ? siweConfig : undefined)
                    }
                  />
                </FormControl>

                <Collapse in={Boolean(options.siweConfig)}>
                  <FormControl>
                    <FormLabel>SIWE Configuration</FormLabel>
                    <IconButton
                      size="sm"
                      icon={jsonEditorDisclosure.isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      onClick={jsonEditorDisclosure.onToggle}
                      aria-label="Toggle JSON editor"
                    />
                    <Collapse in={jsonEditorDisclosure.isOpen}>
                      <Textarea
                        disabled
                        mt={2}
                        value={JSON.stringify(options.siweConfig, null, 2)}
                      />
                    </Collapse>
                  </FormControl>
                </Collapse>
              </Stack>
            </CardBody>
          </Card>
        </Stack>
      </Stack>
    </Box>
  )
}

export default OptionsPage
