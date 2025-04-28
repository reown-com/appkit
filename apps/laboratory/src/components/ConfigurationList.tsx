'use client'

/* eslint-disable no-negated-condition */
import type { ReactNode } from 'react'

import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Link,
  Stack,
  Text
} from '@chakra-ui/react'
import { ArrowRightIcon } from '@radix-ui/react-icons'

import type { SdkOption } from '../utils/DataUtil'
import { RandomLink } from './RandomLink'

type Props = {
  title: ReactNode
  sdkOptions: SdkOption[]
}

export function ConfigurationList({ title, sdkOptions }: Props) {
  return (
    <>
      <Card marginTop={10} marginBottom={10}>
        <CardHeader>
          <Heading size="md">{title}</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing="4">
            {sdkOptions.map(option => (
              <Box key={option.link + option.title}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Heading size="xs" textTransform="uppercase">
                      {option.title}
                    </Heading>
                    <Text pt="2" fontSize="sm">
                      {option.description}
                    </Text>
                  </Box>
                  {option.randomLinks !== undefined && option.randomLinks.length > 0 ? (
                    <RandomLink hrefs={option.randomLinks}>
                      <Button rightIcon={<ArrowRightIcon />}>Go</Button>
                    </RandomLink>
                  ) : (
                    <Link href={option.link}>
                      <Button rightIcon={<ArrowRightIcon />}>Go</Button>
                    </Link>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </>
  )
}
