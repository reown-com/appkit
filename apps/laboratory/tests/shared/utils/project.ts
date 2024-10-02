import { devices } from '@playwright/test'
import { getAvailableDevices } from './device'

const availableDevices = getAvailableDevices()

const LIBRARIES = ['ethers', 'ethers5', 'wagmi', 'solana'] as const
const MULTICHAIN_LIBRARIES = [
  'multichain-basic',
  'multichain-ethers-solana',
  'multichain-ethers5-solana',
  'multichain-wagmi-solana'
] as const

const LIBRARY_PERMUTATIONS = availableDevices.flatMap(device =>
  LIBRARIES.map(library => ({ device, library }))
)

const MULTICHAIN_PERMUTATIONS = availableDevices.flatMap(device =>
  MULTICHAIN_LIBRARIES.map(library => ({ device, library }))
)

interface UseOptions {
  launchOptions: {
    executablePath: string
  }
}

interface CustomProperties {
  testIgnore?: RegExp | string
  testMatch?: RegExp | string
  useOptions?: UseOptions
  grep?: RegExp
}

export type CustomProjectProperties = {
  [T in string]: CustomProperties
}

const SINGLE_ADAPTER_EVM_TESTS = [
  'basic-tests.spec.ts',
  'canary.spec.ts',
  'email.spec.ts',
  'no-email.spec.ts',
  'no-socials.spec.ts',
  'debug-mode.spec.ts',
  'siwe-email.spec.ts',
  'siwe-sa.spec.ts',
  'siwe.spec.ts',
  'smart-account.spec.ts',
  'wallet-features.spec.ts',
  'wallet.spec.ts'
]

const SINGLE_ADAPTER_SOLANA_TESTS = [
  'basic-tests.spec.ts',
  'email.spec.ts',
  'no-email.spec.ts',
  'no-socials.spec.ts',
  'debug-mode.spec.ts',
  'wallet.spec.ts'
]

const SINGLE_ADAPTER_EVM_TESTS_REGEX = new RegExp(
  `^(?!.*/multichain/).*(?:${SINGLE_ADAPTER_EVM_TESTS.join('|')})`,
  'u'
)
const SINGLE_ADAPTER_SOLANA_TESTS_REGEX = new RegExp(
  `^(?!.*/multichain/).*(?:${SINGLE_ADAPTER_SOLANA_TESTS.join('|')})`,
  'u'
)

const customProjectProperties: CustomProjectProperties = {
  'Desktop Chrome/ethers': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX
  },
  'Desktop Firefox/ethers': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX
  },
  'Desktop Chrome/ethers5': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX
  },
  'Desktop Firefox/ethers5': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX
  },
  'Desktop Chrome/wagmi': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX
  },
  'Desktop Firefox/wagmi': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX
  },
  'Desktop Chrome/solana': {
    testMatch: SINGLE_ADAPTER_SOLANA_TESTS_REGEX,
    testIgnore: 'siwe-email.spec.ts'
  },
  'Desktop Firefox/solana': {
    testMatch: SINGLE_ADAPTER_SOLANA_TESTS_REGEX,
    testIgnore: 'siwe-email.spec.ts'
  },
  'Desktop Firefox/multichain-ethers-solana': {
    testMatch: /^.*\/multichain-ethers-.*\.spec\.ts$/u
  },
  'Desktop Firefox/multichain-wagmi-solana': {
    testMatch: /^.*\/multichain-wagmi-.*\.spec\.ts$/u
  },
  'Desktop Firefox/multichain-ethers5-solana': {
    testMatch: /^.*\/multichain-ethers5-.*\.spec\.ts$/u
  },
  'Desktop Firefox/multichain-basic': {
    testMatch: /^.*\/multichain-basic\.spec\.ts$/u
  },
  'Desktop Chrome/multichain-ethers-solana': {
    testMatch: /^.*\/multichain-ethers-.*\.spec\.ts$/u
  },
  'Desktop Chrome/multichain-wagmi-solana': {
    testMatch: /^.*\/multichain-wagmi-.*\.spec\.ts$/u
  },
  'Desktop Chrome/multichain-ethers5-solana': {
    testMatch: /^.*\/multichain-ethers5-.*\.spec\.ts$/u
  },
  'Desktop Chrome/multichain-basic': {
    testMatch: /^.*\/multichain-basic\.spec\.ts$/u
  }
}

export interface Permutation {
  device: string
  library: string
}

export function getProjects() {
  const libraryProjects = LIBRARY_PERMUTATIONS.map(({ device, library }) => {
    let project = {
      name: `${device}/${library}`,
      use: { ...devices[device], library },
      storageState: 'playwright/.auth/user.json'
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

  const multichainProjects = MULTICHAIN_PERMUTATIONS.map(({ device, library }) => {
    let project = {
      name: `${device}/${library}`,
      use: { ...devices[device], library },
      storageState: 'playwright/.auth/user.json'
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

  const projects = [...libraryProjects, ...multichainProjects]

  return projects
}
