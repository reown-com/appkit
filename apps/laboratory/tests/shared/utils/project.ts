import { devices } from '@playwright/test'
import { getAvailableDevices } from './device'
import { getValue } from './config'
import { getLocalBravePath, BRAVE_LINUX_PATH } from '../constants/browsers'

const availableDevices = getAvailableDevices()

const LIBRARIES = ['ethers', 'wagmi', 'solana'] as const

const PERMUTATIONS = availableDevices.flatMap(device =>
  LIBRARIES.map(library => ({ device, library }))
)

interface UseOptions {
  launchOptions: {
    executablePath: string
  }
}

interface CustomProperties {
  testIgnore?: RegExp | string
  testMatch?: string
  useOptions?: UseOptions
  grep?: RegExp
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
    testIgnore: /(?:email\.spec\.ts|smart-account\.spec\.ts).*$/u,
    useOptions: braveOptions
  },
  'Desktop Brave/ethers': {
    testIgnore: /(?:email\.spec\.ts|smart-account\.spec\.ts).*$/u,
    useOptions: braveOptions
  },
  'Desktop Chrome/wagmi': {
    testIgnore: /(?:email\.spec\.ts|smart-account\.spec\.ts).*$/u
  },
  'Desktop Firefox/wagmi': {
    testIgnore: /(?:email\.spec\.ts|smart-account\.spec\.ts).*$/u
  },
  // Exclude email.spec.ts, siwe.spec.ts, and canary.spec.ts from solana, not yet implemented
  'Desktop Chrome/solana': {
    grep: /^(?!.*(?:email\.spec\.ts|siwe\.spec\.ts|canary\.spec\.ts|smart-account\.spec\.ts|wallet\.spec\.ts)).*$/u
  },
  'Desktop Brave/solana': {
    useOptions: braveOptions,
    grep: /^(?!.*(?:email\.spec\.ts|siwe\.spec\.ts|canary\.spec\.ts|smart-account\.spec\.ts|wallet\.spec\.ts)).*$/u
  },
  'Desktop Firefox/solana': {
    grep: /^(?!.*(?:email\.spec\.ts|siwe\.spec\.ts|canary\.spec\.ts|smart-account\.spec\.ts|wallet\.spec\.ts)).*$/u
  },
  'Desktop Safari/solana': {
    grep: /^(?!.*(?:email\.spec\.ts|siwe\.spec\.ts|canary\.spec\.ts|smart-account\.spec\.ts|wallet\.spec\.ts)).*$/u
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
