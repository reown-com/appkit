import { devices } from '@playwright/test'
import { getAvailableDevices } from './device'
import { getValue } from './config'
import { getLocalBravePath, BRAVE_LINUX_PATH } from '../constants/browsers'

const availableDevices = getAvailableDevices()

const LIBRARIES = ['wagmi', 'ethers'] as const

const PERMUTATIONS = availableDevices.flatMap(device =>
  LIBRARIES.map(library => ({ device, library }))
)

interface UseOptions {
  launchOptions: {
    executablePath: string
  }
}

interface CustomProperties {
  testIgnore?: string
  testMatch?: string
  useOptions?: UseOptions
}

export type CustomProjectProperties = {
  [T in string]: CustomProperties
}

const braveOptions: UseOptions = {
  launchOptions: {
    executablePath: getValue(BRAVE_LINUX_PATH, getLocalBravePath())
  }
}

const customProjectProperties: CustomProjectProperties = {
  'Desktop Brave/wagmi': {
    testIgnore: 'email.spec.ts',
    useOptions: braveOptions
  },
  'Desktop Brave/ethers': {
    testIgnore: 'email.spec.ts',
    useOptions: braveOptions
  },
  'Desktop Chrome/wagmi': {
    testIgnore: 'email.spec.ts'
  },
  'Desktop Firefox/wagmi': {
    testIgnore: 'email.spec.ts'
  }
}

export interface Permutation {
  device: string
  library: string
}

export function getProjects() {
  return PERMUTATIONS.map(({ device, library }) => {
    const deviceName = device === 'Desktop Brave' ? 'Desktop Chrome' : device
    let project = {
      name: `${device}/${library}`,
      use: { ...devices[deviceName], library }
    }
    const props = customProjectProperties[project.name]
    if (props) {
      project = { ...project, ...props }
      if (props.useOptions) {
        project.use = { ...project.use, ...props.useOptions }
      }
    }

    return project
  })
}
